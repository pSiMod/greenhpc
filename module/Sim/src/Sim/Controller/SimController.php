<?php

namespace Sim\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class SimController extends AbstractActionController {

    public function indexAction() {
        $view = new ViewModel();
        $view->message = "inside the post body";
        $request = $this->getRequest();

        //if it is a post request
        if ($request->isPost()) {

            //get the path where all the simulation files are stored
            $simulationPath = realpath($_SERVER['DOCUMENT_ROOT'] . '/../data/simulation');

            //make a folder with current date if it dsnt exists.
            $dirname = date('M-d-Y');
            $dirpath = $simulationPath . '/' . $dirname;
            if (!is_dir($dirpath)) {
                $status = mkdir($dirpath, 0777);
                if ($status)
                    $view->status = 'true';
                else
                    $view->status = 'false';
            }

            //save the uploaded file into the directory. If the file already exists
            //then overright it
            $mpiFileStatus = "";
            $mpiFilePath="";
            if ($_FILES["mpiActivityFile"]["error"] > 0) {
                $mpiFileStatus["Error"] = $_FILES["mpiActivityFile"]["error"];
            } else {

                $mpiFilePath = $dirpath . '/' . $_FILES['mpiActivityFile']['name'];
                $mpiFileStatus = $mpiFilePath;
                if (file_exists($mpiFilePath)) {
                    move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                    $mpiFileStatus = 'Updated in ' . $mpiFilePath;
                } else {
                    move_uploaded_file($_FILES['mpiActivityFile'][tmp_name], $mpiFilePath);
                    $mpiFileStatus = 'stored in ' . $mpiFilePath;
                }
            }

            // convert the posted data into comma seperted name:value pairs.
            $view->mpiFileStatus = $mpiFileStatus;
            $rawbody = $_POST;
            $params = "";
            foreach ($rawbody as $key => $value) {
                $params .= $key . ':' . $value . ',';
            }
            // create a params.dat file which will contain the above generted
            //value pairs.
            $paramsPath .= $dirpath . '/params.dat';
            $file = fopen($paramsPath, 'w');
            fwrite($file, $params);
            fclose($file);
            
            $simlocation = realpath($_SERVER['DOCUMENT_ROOT'].'/../bin');
            $simlocation .= "/./simulator ";
            
            $command = $simlocation . $paramsPath ." " . $mpiFilePath;
            $view->command = $command;
            $output = array();
            exec($command,$output);
            $view->rawBody = $output;
        }
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

