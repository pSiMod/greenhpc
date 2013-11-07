<?php

namespace Sim\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class SimController extends AbstractActionController {

    public function indexAction() {
        $view = new ViewModel();
        $success = true;
        $errorMessage = "No Errors";
        $request = $this->getRequest();

        //if it is a post request
        if ($request->isPost()) {

            //get the path where all the simulation files are stored
            
            $scriptlocaton = substr($_SERVER['SCRIPT_FILENAME'], 0, strlen($scriptlocaton) - 10 );
            
            $simulationPath = realpath($scriptlocaton . '/../data/simulation');

            
            
            //make a folder with current date if it dsnt exists.
            $dirname = date('M-d-Y');
            $dirpath = $simulationPath . '/' . $dirname;
            if (!is_dir($dirpath)) {
                $success = mkdir($dirpath, 0777);
            }
                
                if ($success) {

                    //save the uploaded file into the directory. If the file already exists
                    //then overright it
                    
                    if ($_FILES["mpiActivityFile"]["error"] > 0) {
                        $success = false;
                        $errorMessage = "Please upload MPI Activity File";
                    } else {

                        $mpiFilePath = $dirpath . '/' . $_FILES['mpiActivityFile']['name'];
                        $mpiFileStatus = $mpiFilePath;
                        if (file_exists($mpiFilePath)) {
                            move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                        } else {
                            move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                        }

                        // convert the posted data into comma seperted name:value pairs.
                        $rawbody = $_POST;
                        $params = "";
                        foreach ($rawbody as $key => $value) {
                            $params .= $key . ':' . $value . ',';
                        }
                        
                        $params = substr($params, 0, strlen($params)-1);
                        // create a params.dat file which will contain the above generted
                        //value pairs.
                        $paramsPath .= $dirpath . '/params.dat';
                        $file = fopen($paramsPath, 'w');
                        fwrite($file, $params);
                        fclose($file);

                        $simlocation = realpath($_SERVER['DOCUMENT_ROOT'] . '/../bin');
                        $simlocation .= "/./simulator ";

                        $command = $simlocation . $paramsPath . " " . $mpiFilePath;
                        
                        $output = array();
                        exec($command, $output);
                        if (count($output) > 1)
                        {
                            $view->output= $output;    
                        }
                        else
                        {
                            $success =FALSE;
                            $errorMessage = "Failed while executing binary :". $output[0];
                        }
                    }
                } else {
                    $errorMessage = 'Unable to create folder on server. Permission denied';
                }
            }
        
                    $view->success = $success;
                    $view->errorMessage = $errorMessage;

        return $view;
    }

    public function metaprofileAction() {
        return new ViewModel();
    }

    public function archivesAction() {
        return new ViewModel();
    }

    public function analyticsAction() {
        return new ViewModel();
    }

    public function aboutusAction() {
        return new ViewModel();
    }

    public function fileupload() {
        return new ViewModel();
    }

}

