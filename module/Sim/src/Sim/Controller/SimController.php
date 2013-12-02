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
            $jsonparam = $this->convertToJson($_POST);
            $existingMetaProfile = json_decode($_POST['existingMetaProfile']);
            $directoryname = $existingMetaProfile->name;
            $dirpath = $this->simulationDir() . '/' . $directoryname;

            if ($_FILES["mpiActivityFile"]["error"] > 0) {
                $message = "Please upload MPI Activity File";
            } else {
                if (is_dir($dirpath)) {

                    $mpiFilePath = $dirpath . '/' . str_replace(" ", "", $_FILES['mpiActivityFile']['name']);
                    $mpiFileStatus = $mpiFilePath;
                    if (file_exists($mpiFilePath)) {
                        move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                    } else {
                        move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                    }

                    $paramsPath .= $dirpath . '/profile.json';
                    $file = fopen($paramsPath, 'w');
                    fwrite($file, $jsonparam);
                    fclose($file);
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
            $jsonparam = $this->convertToJson($_POST);
            $newMetaProfileName = json_decode($_POST['newMetaProfileName']);
            $directoryname = $newMetaProfileName;
            $dirpath = $this->simulationDir() . '/' . $directoryname;

            if ($_FILES["mpiActivityFile"]["error"] > 0) {
                
                $message = "Please upload MPI Activity File";
            } else {
                if (!is_dir($dirpath)) {
                    $success = mkdir($dirpath, 0777);
                    if ($success) {

                        $mpiFilePath = $dirpath . '/' . str_replace(" ", "", $_FILES['mpiActivityFile']['name']);
                        $mpiFileStatus = $mpiFilePath;
                        if (file_exists($mpiFilePath)) {
                            move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                        } else {
                            move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                        }

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
            $dirname = $_POST["existingMetaProfile"];
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

                    $params = $this->convertToParam($_POST);
                    // create a params.dat file which will contain the above generted
                    //value pairs.
                    $paramsPath .= $dirpath . '/params.dat';
                    $file = fopen($paramsPath, 'w');
                    fwrite($file, $params);
                    fclose($file);

                    $outputfile = $dirpath . "/output.dat";

                    $simlocation = realpath($_SERVER['DOCUMENT_ROOT'] . '/../bin') . "/./titantopologysim_lineal ";

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
                $errorMessage = 'A profile with name ' . $dirname .'does not exist';
            }
        }

        $view->success = $success;
        $view->errorMessage = $errorMessage;

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
            "analyticsWorkflow" => Json::decode($postdata['analyticsWorkflow']),
            "dataAnalyticsType" => Json::decode($postdata['dataAnalyticsType']),
            "archParams" => Json::decode($postdata['archParams']),
            "runtimeParams" => json_decode($postdata['runtimeParams']),
            "appParams" => json_decode($postdata['appParams']),
            "mpiActivityFile" => json_decode($postdata['mpiActivityFile'])
        );
        return json_encode($postjson);
    }

    public function simulationDir() {
        $scriptlocation = substr($_SERVER['SCRIPT_FILENAME'], 0, strlen($_SERVER['SCRIPT_FILENAME']) - 10);
        return realpath($scriptlocation . '/../data/simulation');
    }

    public function getprofileAction() {
        $view = new ViewModel();
        $view->setTerminal(true);
        $profile = $_GET["profile"];
        $dirlocation = $this->simulationDir();
        $filepath = $dirlocation . '/' . $profile . '/profile.json';
        $jsonparams = file_get_contents($filepath);
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

}
