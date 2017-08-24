/**
Considerations:
    - could make this async w/callbacks, but Slack's rate limiting prevents this
    - alternate architecture: instead of deleting files and then making a call to get a new list,
        we could get all files (by using the page param) and then delete all files in that list.
**/

require('dotenv').config()
var request = require('request');

/*
* API
* https://api.slack.com/methods
*/
var apiFileList = "https://slack.com/api/files.list";
var apiDelete = "https://slack.com/api/files.delete";

// Environment variables
var token = process.env.TOKEN;
var channel = process.env.CHANNEL;

// Editable variables
var numFilesToDelete = 1000;
var batchSize = 100; // max 100
var rateLimitDelayMS = 1000; // min 1000

// Do not edit these variables
var numFilesDeleted = 0;
var currentPage = 1;

/**
Deletes the given file.
If this is the last file in the batch, calls deleteAllUnpinnedFiles again
**/
function deleteFile(file, isLastFile) {

    var url = `${apiDelete}?token=${token}&file=${file.id}`,
        hasError = false;

    // console.log("Calling deletion API: ", url);
    // console.log("Deleting file: ", file.title);

    if (numFilesDeleted < numFilesToDelete) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                if (json.ok) {
                    console.log(`Deleted file: "${file.title}"`);
                    numFilesDeleted++;
                } else {
                    hasError = true;
                }
            } else {
                hasError = true;
            }

            if (hasError) {
                console.log(`There was an error while deleting a file: ${error}. Status code: ${response.statusCode}`);
            }

            // Make another call to delete files. It will decide when to break
            if (isLastFile) {
                currentPage++;
                deleteAllUnpinnedFiles();
            }

        });
    }
}

/**
Iterates through files.list and if the file is not pinned, deletes it
**/
function parseFiles (files) {
    // Print number of files received
    if (files) {
        console.log(`Parsing ${files.length} files.`)
    }

    var delayIncrement = 0;
    
    // Iterate files
    files.forEach(function (file, index) {
        if (file.pinned_to) {
            console.log(`Ignoring pinned file: "${file.title}"`);
        } else {
            // Make synchronous requests due to Slack's rate limiting
            setTimeout(function () {
                deleteFile(file, index == files.length - 1)
            }, delayIncrement * rateLimitDelayMS);

            delayIncrement++;
        }
    });
}

/**
Entry function to get a list of files and delete (if not pinned) 
until a specified number of files has been deleted or we're out of files
**/
function deleteAllUnpinnedFiles () {

    var url = `${apiFileList}?token=${token}&count=${batchSize}&page=${currentPage}`,
        hasError = false;
 
    // Make the API call
    console.log(`Number of files deleted: ${numFilesDeleted}`);
    if (numFilesDeleted < numFilesToDelete) {
        console.log(`Calling: ${url}`);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                if (json.ok){
                    if (json.files.length) {
                        parseFiles(json.files);
                    }
                } else {
                    hasError = true;
                }
            } else {
                hasError = true;
            }
            if (hasError) {
                console.log(`There was an error while requesting files: ${error}. Status code: ${response.statusCode}`);
            }
        });
    }
}

deleteAllUnpinnedFiles();