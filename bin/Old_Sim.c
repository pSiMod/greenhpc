#include <iostream>
#include <assert.h>
#include <boost/algorithm/string.hpp>
#include <fstream>
#include <string>
#include <vector>

using namespace std;

#define N_NODES_X 25
#define N_NODES_Y 32
#define N_NODES_Z 24

#ifndef THREADS_PER_CPU
#define THREADS_PER_CPU 16
#endif


class Point {
	public:
		unsigned int x, y, z;
};

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


int main (int argc, char **argv)
{
	int numMPIranks;
	int maxrank=0;

	if(argc != 4) {
		cout << "Usage: " << argv[0] << " /path/to/input/file /path/to/output/file numMPIranks(only relevant to RANDOM_SUBSET_MACHINE_ALLOC)" << endl;
		return 1;
	}

	ifstream inputfile;
	ofstream outputfile;
	inputfile.open(argv[1]);
	outputfile.open(argv[2]);

	if (!inputfile.is_open()) {
                cout << "Error: file does not exist" << endl;
                return 1;
	}

        if (!outputfile.is_open()) {
                cout << "Error: output file can't be opened" << endl;
                return 1;
        }

	numMPIranks = atoi(argv[3]);

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

#ifdef LINEAL_ALLOC
	// lineal allocation
	int myrank=0;
        for(int ii=0 ; ii<N_NODES_X ; ii++) {
                for(int jj=0 ; jj<N_NODES_Y ; jj++) {
                        for(int kk=0 ; kk<N_NODES_Z ; kk++) {
                                for(int cpu=0 ; cpu<2 ; cpu++) {
                                        for(int thread=0 ; thread<THREADS_PER_CPU ; thread++) {
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
#endif


#ifdef RANDOM_WHOLE_MACHINE_ALLOC
	// create a list of mpi ranks
	std::srand ( unsigned ( std::time(0) ) );
	std::vector<int> randomized_rank_list;
	for (int i=1; i<(N_NODES_X * N_NODES_Y * N_NODES_Z * 2 * THREADS_PER_CPU); ++i) randomized_rank_list.push_back(i); // 1 2 3 4 5 6 7 8 9
	std::random_shuffle ( randomized_rank_list.begin(), randomized_rank_list.end() );

	// random allocation
	int rankid=0;
        for(int ii=0 ; ii<N_NODES_X ; ii++) {
                for(int jj=0 ; jj<N_NODES_Y ; jj++) {
                        for(int kk=0 ; kk<N_NODES_Z ; kk++) {  
                                for(int cpu=0 ; cpu<2 ; cpu++) {
                                        for(int thread=0 ; thread<THREADS_PER_CPU ; thread++) {
						int myrank=randomized_rank_list[rankid];
                                                nodes[ii][jj][kk].myranks[cpu][thread] = myrank;
                                                nodes_by_rank[myrank] = &(nodes[ii][jj][kk]);
                                                nodes_by_rank_cpu[myrank] = cpu;
                                                rankid++;
                                        }
                                }
                        }
                }
        }
        maxrank=rankid-1;
#endif 

#ifdef RANDOM_SUBSET_MACHINE_ALLOC
        // create a list of mpi ranks
        std::srand ( unsigned ( std::time(0) ) );
        std::vector<int> randomized_rank_list;
        for (int i=1; i<numMPIranks; ++i) randomized_rank_list.push_back(i); // 1 2 3 4 5 6 7 8 9
        std::random_shuffle ( randomized_rank_list.begin(), randomized_rank_list.end() );

        // random allocation
        int rankid=0;
        for(int ii=0 ; ii<N_NODES_X ; ii++) {
                for(int jj=0 ; jj<N_NODES_Y ; jj++) {
                        for(int kk=0 ; kk<N_NODES_Z ; kk++) {
                                for(int cpu=0 ; cpu<2 ; cpu++) {
                                        for(int thread=0 ; thread<THREADS_PER_CPU ; thread++) {
						if(rankid < numMPIranks) {
	                                                int myrank=randomized_rank_list[rankid];
        	                                        nodes[ii][jj][kk].myranks[cpu][thread] = myrank;
                	                                nodes_by_rank[myrank] = &(nodes[ii][jj][kk]);
                        	                        nodes_by_rank_cpu[myrank] = cpu;
                                	                rankid++;
						}
                                        }
                                }
                        }
                }
        }
        maxrank=rankid-1;
#endif



#ifdef CORES_PER_CPU_ALLOC
        int myrank=0;
        for(int ii=0 ; ii<N_NODES_X ; ii++) {
                for(int jj=0 ; jj<N_NODES_Y ; jj++) {
                        for(int kk=0 ; kk<N_NODES_Z ; kk++) {
                                for(int cpu=0 ; cpu<2 ; cpu++) {
                                        for(int thread=0 ; thread<CORES_PER_CPU_ALLOC ; thread++) {
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
#endif



	unsigned long long total_size_per_hop=0;
	while(inputfile.good()) {
		string line;
		getline(inputfile,line);
		vector<string> strings;
		boost::split(strings, line, boost::is_any_of("\t "));
		if(strings.size() != 5) {
			continue;
	                cout << "Error: size of strings in line \"" << line << "\" is not 5"<< endl;
			return 1;
		}
		if(atoi(strings[0].c_str()) > maxrank && atoi(strings[1].c_str()) > maxrank) {
                        cout << "Error: requesting rank outside of range!"<< endl;
                        return 1;
		}
		unsigned int hops = findShortestRouteLength(
			atoi(strings[0].c_str()),
			atoi(strings[1].c_str()));
		total_size_per_hop += hops* atoi(strings[4].c_str());
		outputfile <<
			strings[0] << " " <<
			strings[1] << " " <<
			strings[2] << " " <<
			strings[3] << " " <<
			strings[4] << " " <<
			hops << endl;
	}
	cout << total_size_per_hop << endl;

	inputfile.close();
	outputfile.close();
	return 0;
}
