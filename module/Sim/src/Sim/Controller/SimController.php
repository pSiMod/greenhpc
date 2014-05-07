<?php

namespace Sim\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\Json\Json;

class SimController extends AbstractActionController {

    public function indexAction() {
        $view = new ViewModel();
        return $view;
    }

    public function metaprofileAction() {
        return new ViewModel();
    }

    public function archivesAction() {
        return new ViewModel();
    }

    public function analyticsAction() {
        $request = $this->getRequest();
        $view = new ViewModel();
        if ($request->isPost()) {
            $view->postdata = TRUE;
            $view->imageurl = "/img/commgraph.png";
        }

        return $view;
    }

    public function aboutusAction() {
        return new ViewModel();
    }

    public function saveAction() {
        $view = new ViewModel();
        $view->setTerminal(true);
        $request = $this->getRequest();
        $message = "";
        if ($request->isPost()) {
            $testName = $_GET["name"];
            if($testName == "workflowParamProfile")
            {
                 $workflowParamProfile = $_POST["workflowParamProfile"];
                 $filepath = $this->simulationDir() . '/../workflowParamProfile.json';
                 $file = fopen($filepath,'w');               
                 fwrite($file,$workflowParamProfile);
                 fclose($file);
                 $message = 'Successfully saved workflow profile ';
            }
            elseif($testName == "archParamProfile")
            {
                 $archParamProfile = $_POST["archParamProfile"];
                 $filepath = $this->simulationDir() . '/../archParamProfile.json';
                 $file = fopen($filepath,'w');               
                 fwrite($file,$archParamProfile);
                 fclose($file);
                 $message = 'Successfully saved architecture profile ';
            }
            elseif($testName == "applicationParamProfile")
            {
                 $archParamProfile = $_POST["applicationParamProfile"];
                 $filepath = $this->simulationDir() . '/../applicationParamProfile.json';
                 $file = fopen($filepath,'w');               
                 fwrite($file,$archParamProfile);
                 fclose($file);
                 $message = 'Successfully saved application profile';
            }
            elseif($testName == "runtimeParamProfile")
            {
                 $archParamProfile = $_POST["runtimeParamProfile"];
                 $filepath = $this->simulationDir() . '/../runtimeParamProfile.json';
                 $file = fopen($filepath,'w');               
                 fwrite($file,$archParamProfile);
                 fclose($file);
                 $message = 'Successfully saved runtime profile';
            }
            else
            {
            $existingMetaProfile = json_decode($_POST['existingMetaProfile']);
            $directoryname = $existingMetaProfile->name;
            $dirpath = $this->simulationDir() . '/' . $directoryname;
            if (is_dir($dirpath)) {

                //updating the profile
                $jsonparam = $this->convertToJson($_POST);
                $paramsPath .= $dirpath . '/profile.json';
                $file = fopen($paramsPath, 'w');
                fwrite($file, $jsonparam);
                fclose($file);

                // create a params.dat file which will contain the above generted
                //value pairs.
                /*$params = $this->convertToParam($_POST);
                $paramsPath .= $dirpath . '/params.dat';
                $file = fopen($paramsPath, 'w');
                fwrite($file, $params);
                fclose($file);*/

                $message = 'Successfully Saved to ' . $directoryname;
            } else {
                $message = "Profile doesnt exist on server";
            }
        }
        } else {
            $message = 'Unable to save';
        }

        $view->message = $message;
        return $view;
    }

    public function saveasAction() {
        $view = new ViewModel();
        $view->setTerminal(true);
        $request = $this->getRequest();
        $message = "";
        if ($request->isPost()) {
            $newMetaProfileName = json_decode($_POST['newMetaProfileName']);
            $directoryname = $newMetaProfileName;
            $dirpath = $this->simulationDir() . '/' . $directoryname;
            if (!is_dir($dirpath)) {
                $success = mkdir($dirpath, 0777);
                if ($success) {


                    $jsonparam = $this->convertToJson($_POST);
                    $paramsPath .= $dirpath . '/profile.json';
                    $file = fopen($paramsPath, 'w');
                    fwrite($file, $jsonparam);
                    fclose($file);


                    $message = 'Successfully Saved to ' . $directoryname;
                } else {
                    $message = "Not able to create new directory on server.";
                }
            } else {
                $message = "Profile already exist on server";
            }
        } else {
            $message = 'Unable to save';
        }
        $view->message = $message;
        return $view;
    }

    public function simulateAction() {
        $view = new ViewModel();
        $view->setTerminal(true);
        $success = true;
        $errorMessage = "No Errors";
        $request = $this->getRequest();

        //if it is a post request
        if ($request->isPost()) {

            //get the path where all the simulation files are stored
            $simulationPath = $this->simulationDir();

            //make a folder with current date if it dsnt exists.
            $existingMetaProfile = json_decode($_POST['existingMetaProfile']);
            $dirname = $existingMetaProfile->name;
            $dirpath = $simulationPath . '/' . $dirname;
            if (!is_dir($dirpath)) {
                $success = false;
            }

            if ($success) {

                //save the uploaded file into the directory. If the file already exists
                //then overright it

                if ($_FILES["mpiActivityFile"]["error"] > 0) {
                    $success = false;
                    $errorMessage = "Please upload MPI Activity File";
                } else {

                    $mpiFilePath = $dirpath . '/' . str_replace(" ", "", $_FILES['mpiActivityFile']['name']);
                    $mpiFileStatus = $mpiFilePath;
                    if (file_exists($mpiFilePath)) {
                        move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                    } else {
                        move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                    }

                    // convert the posted data into comma seperted name:value pairs.

                    $jsonparams = $this->convertToJson($_POST);
                    // create a params.dat file which will contain the above generted
                    //value pairs.
                    $paramsPath .= $dirpath . '/profile.json';
                    $file = fopen($paramsPath, 'w');
                    fwrite($file, $jsonparams);
                    fclose($file);

                    $outputfile = $dirpath . "/output.dat";

                    $simlocation = realpath($_SERVER['DOCUMENT_ROOT'] . '/../bin') . "/./simulation ";

                    $command = $simlocation . $paramsPath . " " . $mpiFilePath . " " . $outputfile;

                    $output = array();
                    exec($command, $output);
                    if (count($output) > 1) {
                        $view->output = $output;
                    } else {
                        $success = FALSE;
                        $errorMessage = "Failed while executing binary :" . $output[0];
                    }
                }
            } else {
                $errorMessage = 'A profile with name ' . $dirname . 'does not exist';
            }
        }

        $view->success = $success;
        $view->errorMessage = $errorMessage;

        return $view;
    }

    public function plotAction() {
        $view = new ViewModel();
        $view->setTerminal(true);
        $message = '';
        $output = array();
        $request = $this->getRequest();
        if ($request->isPost()) {
            $metaprofile = $_POST['metaProfileName'];
            $simulationpath = $this->simulationDir();
            $dirpath = $simulationpath . '/' . $metaprofile;
            if (is_dir($dirpath)) {
                //$paramsfile = $dirpath . '/params.dat';

                $paramsfile = $dirpath . '/profile.json';
                $jsonprofile = file_get_contents($paramsfile);
                $arrayprofile = json_decode($jsonprofile);
                $mpifilename = $arrayprofile->mpiActivityFile;

                $mpiFilePath = $dirpath . '/' . $mpifilename;

                $xparam = $_POST['xaxisparams'];
                $yparam = $_POST['yaxisparams'];
                $rangestart = $_POST['rangestart'];
                $rangeend = $_POST['rangeend'];
                $rangestep = $_POST['rangestep'];

                $outputfile = $dirpath . "/output.dat";

                $simlocation = realpath($simulationpath . '/../../bin') . "/./plot ";

                $command = $simlocation . $paramsfile . " " . $mpiFilePath . " " . $outputfile . " ";
                $command = $command . $xparam . " " . $yparam . " " . $rangestart . " " . $rangeend . " " . $rangestep;
                $cmdoutput = array();
                
                
                exec($command, $cmdoutput);
                foreach ($cmdoutput as $line) {
                    $value = explode(':', $line);
                    array_push($output, [$value[0],$value[1]]);
                }
                {
                    
                }
            } else {
                $message = "Profile doesnot exists";
            }
        }
        $result = array("message"=> $message,"output"=>$output);
        $view->message = json_encode($result);
        return $view;
    }

    public function getprofileAction() {
        $view = new ViewModel();
        $view->setTerminal(true);
        $profile = $_GET["profile"];
        $dirlocation = $this->simulationDir();
        $jsonparams = "";
        if($profile == "workflowProfiles")
        {
            $filepath = $dirlocation . '/../workflowParamProfile.json';
            $jsonparams = file_get_contents($filepath);
        }
        elseif($profile == "runtimeProfiles")
        {
            $filepath = $dirlocation . '/../runtimeParamProfile.json';
            $jsonparams = file_get_contents($filepath);
        }
        elseif($profile == "appProfiles")
        {
            $filepath = $dirlocation . '/../applicationParamProfile.json';
            $jsonparams = file_get_contents($filepath);
        }
        elseif($profile == "archProfiles")
        {
            $filepath = $dirlocation . '/../archParamProfile.json';
            $jsonparams = file_get_contents($filepath);
        }
        else
        {
        $filepath = $dirlocation . '/' . $profile . '/profile.json';
        $jsonparams = file_get_contents($filepath);
        }
        $view->jsondata = $jsonparams;
        return $view;
    }

    public function getExistingProfilesAction() {

        $view = new ViewModel();
        $view->setTerminal(true);
        $dirlocation = $this->simulationDir();
        $cmd = "ls " . $dirlocation . '/';
        $output = array();
        exec($cmd, $output);

        $newOutput = array();
        foreach ($output as $key => $value) {
            array_push($newOutput, ['name' => $value]);
        }

        $simplifiedArray = array_values($newOutput);
        $newarray = array("existingMetaProfileOptions" => $simplifiedArray);
        $view->param = json_encode($newarray);

        return $view;
    }

    private function convertToParam($postdata) {

        $params = "";

        $tempVar = Json::decode($postdata['analyticsWorkflow']);
        foreach ($tempVar as $key => $value) {
            $params .= 'analyticsWorkflow' . ':' . $value . ',';
        }
        $tempVar = Json::decode($postdata['dataAnalyticsType']);
        foreach ($tempVar as $key => $value) {
            $params .= 'dataAnalyticsType' . ':' . $value . ',';
        }

        $tempVar = Json::decode($postdata['archParams']);
        foreach ($tempVar as $key => $value) {

            $params .= $value->name . ':' . $value->value . ',';
        }
        $tempVar = json_decode($postdata['runtimeParams']);
        foreach ($tempVar as $key => $value) {

            $params .= $value->name . ':' . $value->value . ',';
        }
        $tempVar = json_decode($postdata['appParams']);
        foreach ($tempVar as $key => $value) {

            $params .= $value->name . ':' . $value->value . ',';
        }
        $params .= 'mpiActivityFile' . ':' . str_replace(" ", "", $postdata['mpiActivityFile']);
        return $params;
    }

    private function convertToJson($postdata) {
        $postjson = array(
            "workflowParams" => Json::decode($postdata['workflowParams']),
            "archParams" => Json::decode($postdata['archParams']),
            "runtimeParams" => json_decode($postdata['runtimeParams']),
            "appParams" => json_decode($postdata['appParams']),
            "mpiActivityFile" => $postdata['mpiActivityFile']
        );
        return json_encode($postjson);
    }

    private function simulationDir() {
        $scriptlocation = substr($_SERVER['SCRIPT_FILENAME'], 0, strlen($_SERVER['SCRIPT_FILENAME']) - 10);
        return realpath($scriptlocation . '/../data/simulation');
    }

}
