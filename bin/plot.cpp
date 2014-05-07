#include <iostream>
#include <assert.h>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <json/json.h>

using namespace std;

#define N_NODES_X 25
#define N_NODES_Y 32
#define N_NODES_Z 24
// Define max cores/node that we can choose because of the existing code limitations...
#define THREADS_PER_CPU 64



/*** Deprecated... to be removed ***/
int nicActivePower;
int nicBw;


/*** Required params ***/

int mpiRanksNode;
int coresPerNode=16;
int Cores;
//int FanIn;
float Time;
unsigned long long Ops;
unsigned long long LdSt;
int staticPower = 130;
unsigned long long BwNet;
unsigned long long BwMem;
int Pnic = 85;
int Pcpu = 115;
int Pmem = 30;

int PlocalTransfer = 25; //Constant for the moment


//Constants
unsigned long long MAXmips = 2777396839680;
unsigned long long MAXLdStps = 10399176793028;


string paramString;
map<string,string> params;

	ifstream paramsfile;
	//ifstream inputfile;
	ofstream outputfile;
    
    
    
    
    int paramsUsed[20];
    const char *paramsNames[20];





/////////////


vector<std::string> &split(const string &s, char delim, vector<string> &elems) {
    stringstream ss(s);
    string item;
    while (getline(ss, item, delim)) {
        elems.push_back(item);
    }
    return elems;
}


vector<string> split(const string &s, char delim) {
    vector<string> elems;
    split(s, delim, elems);
    return elems;
}



/////////////


// stores the location of the node
class Point {
public:
    unsigned int x, y, z;
};

//
class GeminiNIC {
public:
    unsigned int myranks[2][THREADS_PER_CPU];
    Point p;
};


GeminiNIC nodes[N_NODES_X][N_NODES_Y][N_NODES_Z];
GeminiNIC *nodes_by_rank[N_NODES_X * N_NODES_Y * N_NODES_Z * 2 * THREADS_PER_CPU];
int nodes_by_rank_cpu[N_NODES_X * N_NODES_Y * N_NODES_Z * 2 * THREADS_PER_CPU];


unsigned int findShortestRouteLength1D(unsigned int rank1Dimension, unsigned int rank2Dimension, unsigned int totalranksDimension)
{
	unsigned int rankMax = rank1Dimension > rank2Dimension ? rank1Dimension : rank2Dimension;
	unsigned int rankMin = rank1Dimension > rank2Dimension ? rank2Dimension : rank1Dimension;
    
	// Check path without edges
	unsigned long path_without_edges = rankMax-rankMin;
    
	// Check path with edges
	unsigned long path_with_edges = rankMin + 1 + (totalranksDimension - rankMax - 1);
    
	return path_with_edges >= path_without_edges? path_without_edges : path_with_edges;
}


unsigned int findShortestRouteLength(unsigned int rank1, unsigned int rank2)
{
	unsigned int l=0;
    
	if(rank1 == rank2)
		return 0;
    
	// Check if same GeminiNIC
	if(nodes_by_rank[rank1]==nodes_by_rank[rank2]) {
		// Check if same CPU
		if(nodes_by_rank_cpu[rank1]==nodes_by_rank_cpu[rank2]) {
			// Yes
			l=0;
		} else {
			// No
			l=2;
		}
	} else {
		// Initial hop, from CPU to NIC
		// Final hop, from NIC to CPU
		l=2;
        
		// Calculate path X
		l += findShortestRouteLength1D(
                                       nodes_by_rank[rank1]->p.x,
                                       nodes_by_rank[rank2]->p.x,
                                       N_NODES_X);
		// Calculate path Y
        l += findShortestRouteLength1D(
                                       nodes_by_rank[rank1]->p.y,
                                       nodes_by_rank[rank2]->p.y,
                                       N_NODES_Y);
		// Calculate path Z
        l += findShortestRouteLength1D(
                                       nodes_by_rank[rank1]->p.z,
                                       nodes_by_rank[rank2]->p.z,
                                       N_NODES_Z);
        
	}
	return l;
}



/**************/

// Returns remote messages * hops * datasize
unsigned long long energyNetwork(int threadsPerCpu, char *mpiTrace, unsigned long long *localData,  unsigned long long *remoteData){
    
    int maxrank=0;
    ifstream inputfile;
    unsigned long long total_size_per_hop = 0;
    unsigned long long total_local_data = 0;
    unsigned long long total_remote_data = 0;
    
    
    inputfile.open(mpiTrace);
    
    if (!inputfile.is_open()) {
        cout << "Error: MPI file doesnt exist" << endl;
        return 1;
	}
    
    for(int ii=0 ; ii<N_NODES_X ; ii++) {
        for(int jj=0 ; jj<N_NODES_Y ; jj++) {
            for(int kk=0 ; kk<N_NODES_Z ; kk++) {
                // Initialize node positions
                nodes[ii][jj][kk].p.x = ii;
                nodes[ii][jj][kk].p.y = jj;
                nodes[ii][jj][kk].p.z = kk;
            }
        }
    }
    
    // lineal allocation
    int myrank=0;
    for(int ii=0 ; ii<N_NODES_X ; ii++) {
        for(int jj=0 ; jj<N_NODES_Y ; jj++) {
            for(int kk=0 ; kk<N_NODES_Z ; kk++) {
                for(int cpu=0 ; cpu<2 ; cpu++) {
                    for(int thread=0 ; thread<threadsPerCpu ; thread++) {
                        nodes[ii][jj][kk].myranks[cpu][thread] = myrank;
                        nodes_by_rank[myrank] = &(nodes[ii][jj][kk]);
                        nodes_by_rank_cpu[myrank] = cpu;
                        myrank++;
                    }
                }
            }
        }
    }
    maxrank=myrank-1;
    
    while(!inputfile.eof()) {
        string line;
        getline(inputfile,line);
        vector<string> strings;
        
        strings=split(line, ':');
        
        if(!strings.empty()){
            
            unsigned int hops = findShortestRouteLength(
                                                        atoi(strings[0].c_str()),
                                                        atoi(strings[1].c_str()));
            
            if(hops==0){
                total_local_data += atol(strings[2].c_str());
            }
            else{
                total_remote_data += atol(strings[2].c_str());
                total_size_per_hop += hops* atol(strings[2].c_str());
            }
        }
    }
    
    inputfile.close();
    
    *localData = total_local_data;
    *remoteData= total_remote_data;
    return total_size_per_hop;
    
}







float computeSim(char *mymetric, char *mpitrace){
    
    
    unsigned long long remoteDataHops;
    unsigned long long localData;
    unsigned long long remoteData;
    string metric(mymetric);
    
    
    
    // Arguments: mpiRanks_per_node, MPItrace_filename
    remoteDataHops = energyNetwork(mpiRanksNode, mpitrace, &localData, &remoteData);
    // Returns total number of messages * size (independently of hops)
    // % local communication = (localData/(localData+remoteData))*100
    float PerLocalComm = 100*(float)localData/(localData+remoteData);
    
    
    
    /*************************/
    /* MODEL */
    /*************************/
    
    // MIPS and Ld+St per second
    unsigned long long Mips = Ops/Time;
    unsigned long long LdStps = LdSt/Time;
    
    // time and energy for remote, local communication + total
    float timeTransfers = (float)remoteDataHops/BwNet;
    float EnergyRemoteTransfers = timeTransfers*Pnic;
    float EnergyLocalTransfers = PlocalTransfer*(float)localData/BwMem;
    float TotalEnergyTransfers = EnergyRemoteTransfers+EnergyLocalTransfers;
    
    //Power and energy subsystems and totals
    float PowerCpu = Pcpu*Cores*(float)Mips/MAXmips;
    float PowerMem = Pmem*Cores*(float)LdStps/MAXLdStps;
    unsigned long long EnergySystem = (PowerCpu+PowerMem)*Time;
    unsigned long long EnergyIdle = staticPower*Cores*Time;
    unsigned long long TotalEnergy = TotalEnergyTransfers+EnergySystem+EnergyIdle;
    float AVGPowerNode = (float)TotalEnergy/Cores/Time;
    float PerEnergyComm = 100*(float)TotalEnergyTransfers/TotalEnergy;
    unsigned long long TotalPower = TotalEnergy/Time;
    
    //cout<< "Percentage_Local_Communication:"<<PerLocalComm<<"%"<<endl;
    //cout<< "Percentage_Energy_for_Communication:"<<PerEnergyComm<<"%"<<endl;
    //cout<< "Total_Energy:"<<TotalEnergy<<"J"<<endl;
    //cout<< "Average_Total_Power:"<<TotalPower<<"W"<<endl;
    //cout<< "Average_Power_per_Node:"<<AVGPowerNode<<"W"<<endl;
    
    
    if(!metric.compare("PercentageLocalCommunication")){
        return PerLocalComm;
    }
    if(!metric.compare("PercentageEnergyforCommunication")){
        return PerEnergyComm;
    }
    if(!metric.compare("TotalEnergy")){
        return (float)TotalEnergy;
    }
    if(!metric.compare("AverageTotalPower")){
        return (float)TotalPower;
    }
    if(!metric.compare("AveragePowerperNode")){
        return AVGPowerNode;
    }
    
    return 0;
    
}






/**
 
 Program Execution : <Program name>  /path/to/arguments/file /path/to/mpi/file /path/to/output/file(only relevant to RANDOM_SUBSET_MACHINE_ALLOC)
 
 argv[1] - is the simulation parameter file, it contains data in csv and colon seperated format.
 eg. ParamName:value,ParamName:value,ParamName:value
 argv[2] - contains location of the uploaded MPI file.
 argv[3] contains location where the output file will be stored
 
 [4] - metric (Y axis)
 [5] - parameter (X axis)
 [6] - from (X axis)
 [7] - to (X axis)
 [8] - step (X axis)
 
 **/

int main (int argc, char **argv)
{
    
    
    if(argc < 8) {
        cout << "Invalid no. of Arguments"<< endl;
        return 1;
	}
    
    
	paramsfile.open(argv[1]);
	//inputfile.open(argv[2]);
	outputfile.open(argv[3]);
    
	if (!paramsfile.is_open()) {
        cout << "Error: Input file doesnt exist" << endl;
        return 1;
	}
	//if (!inputfile.is_open()) {
    //    cout << "Error: MPI file doesnt exist" << endl;
    //    return 1;
	//}
    
    if (!outputfile.is_open()) {
        cout << "Error: output file can't be opened" << endl;
        return 1;
    }
    
    
    paramsNames[0]="MPIRanksperNode"; //"mpiRanksNode"-old
    paramsNames[1]="CoresperNode";
    paramsNames[2]="CPUCores";
    paramsNames[3]="ExecutionTime(s)";
    paramsNames[4]="IntegerOperations";
    paramsNames[5]="MemoryOperations";
    paramsNames[6]="StaticPower";
    paramsNames[7]="BWNetwork";
    paramsNames[8]="BWMemory";
    paramsNames[9]="PowerNIC";
    paramsNames[10]="PowerCPU";
    paramsNames[11]="PowerMemory";
    
    
    for(int i=0; i<20;i++){
        paramsUsed[i]=0;
    }
    
    
	Json::Value root;
    Json::Reader reader;
    
    bool parserResult = reader.parse(paramsfile,root);
    
    if(!parserResult)
    {
        cout<< "Failed to parse the profile information\n";
        return 1;
    }
     
    Json::Value archParams = root["archParams"]["parameters"];
    
    for(int i = 0 ; i< archParams.size(); i++){
    
        if(!archParams[i]["name"].asString().compare("CoresperNode")){
            coresPerNode = atoi(archParams[i]["value"].asCString());
            paramsUsed[1]=1;
        }
        
        if(!archParams[i]["name"].asString().compare("CPUCores")){
            Cores = atoi(archParams[i]["value"].asCString());
            paramsUsed[2]=1;
        }
        
        /*
         if(!strings[0].compare("Fain-In")){
         FanIn = atoi(strings[1].c_str());
         }
         else{
         
         missingParameters=1;
         cout<< "Missing Parameter:"<<"FanIn"<<endl;
         }
         */
        
        
        
        /****************/
        if(!archParams[i]["name"].asString().compare("StaticPower")){
            staticPower = atoi(archParams[i]["value"].asCString());
            paramsUsed[6]=1;
        }
        
        /****************/
        if(!archParams[i]["name"].asString().compare("BWNetwork")){
            BwNet = atol(archParams[i]["value"].asCString());
            paramsUsed[7]=1;
        }
        
        /****************/
        if(!archParams[i]["name"].asString().compare("BWMemory")){
            BwMem = atol(archParams[i]["value"].asCString());
            paramsUsed[8]=1;
        }
        
        /****************/
        if(!archParams[i]["name"].asString().compare("PowerNIC")){
            Pnic = atoi(archParams[i]["value"].asCString());
            paramsUsed[9]=1;
        }
        
        /****************/
        if(!archParams[i]["name"].asString().compare("PowerCPU")){
            Pcpu = atoi(archParams[i]["value"].asCString());
            paramsUsed[10]=1;
        }
        
        /****************/
        if(!archParams[i]["name"].asString().compare("PowerMemory")){
            Pmem = atoi(archParams[i]["value"].asCString());
            paramsUsed[11]=1;
        }
        
    }
    
    
    Json::Value analysisRuntimeParam= root["runtimeParams"]["analysis"]["parameters"];
    
    for(int i =0 ; i < analysisRuntimeParam.size();i++)
    {
        //cout<<analysisRuntimeParam[i]["name"].asString()<<"\n";
        if(!analysisRuntimeParam[i]["name"].asString().compare("analysisMPIrankspernode")){
            mpiRanksNode = atoi(analysisRuntimeParam[i]["value"].asCString());
            paramsUsed[0]=1;
        }
    }
    
    Json::Value analysisAppParam= root["appParams"]["analysis"]["parameters"];
    
    for(int i =0 ; i < analysisAppParam.size();i++)
    {
        //cout<<analysisAppParam[i]["name"].asString()<<"\n";
        
        if(!analysisAppParam[i]["name"].asString().compare("analysisExecutionTime(s)")){
            Time = atof(analysisAppParam[i]["value"].asCString());
            paramsUsed[3]=1;
        }
        
        /****************/
        if(!analysisAppParam[i]["name"].asString().compare("analysisIntegerOperations")){
            Ops = atol(analysisAppParam[i]["value"].asCString());
            paramsUsed[4]=1;
        }
        
        /****************/
        if(!analysisAppParam[i]["name"].asString().compare("analysisMemoryOperations")){
            LdSt = atol(analysisAppParam[i]["value"].asCString());
            paramsUsed[5]=1;
        }
    }
    
    
    int missing=0;
    for(int i=0; i<12;i++){
        if(!paramsUsed[i]){
            cout<< "Missing Parameter:"<<paramsNames[i]<<endl;
            missing=1;
        }
    }
    if(missing){
        return 1;
    }
    
    
    
    char *metric = argv[4];
    char *myparam = argv[5];
    int from = atoi(argv[6]);
    int to = atoi(argv[7]);
    int step = atoi(argv[8]);
    
    
    string param(metric);
    
    
    for(int i=from; i<=to; i+=step){
    
        // change value of param based on param (we have to make if...)        
        if(!param.compare("MPIRanksperNode")){
            mpiRanksNode = i;
        }
        if(!param.compare("CoresperNode")){
            coresPerNode = i;
        }
        if(!param.compare("CPUCores")){
            Cores = i;
        }
        //if(!param.compare("Execution Time(s)")){
        //    Time = i;
        //}
        if(!param.compare("IntegerOperations")){
            Ops = i;
        }
        if(!param.compare("MemoryOperations")){
            LdSt = i;
        }
        if(!param.compare("StaticPower")){
            staticPower = i;
        }
        if(!param.compare("BWNetwork")){
            BwNet = i;
        }
        if(!param.compare("BWMemory")){
            BwMem = i;
        }
        if(!param.compare("PowerNIC")){
            Pnic = i;
        }
        if(!param.compare("PowerCPU")){
            Pcpu = i;
        }
        if(!param.compare("PowerMemory")){
            Pmem = i;
        }
        
        float res = computeSim(myparam, argv[2]);
    
        cout<<i<<":"<<res<<endl;
    
    }
    
    
    //cout<< "Energy for remote communication:"<<EnergyRemoteTransfers<<"J"<<endl;
    //cout<< "Energy for local communication:"<<EnergyLocalTransfers<<"J"<<endl;
    //cout<< "Total Energy for communication:"<<TotalEnergyTransfers<<"J"<<endl;
    
    
	paramsfile.close();
	//inputfile.close();
	outputfile.close();
	return 0;
}
