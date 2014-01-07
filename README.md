# MUNI Resolution Writing Software

This is the git repo for the MUNI Resolution Writing Software, It's built on a roughly MEAN stack meaning it needs Nodejs and will need MongoDB to run.

## Requirements

* NodeJS
* MongoDB
* wkhtmltopdf

## Todo:

* Integration with Backend - MongoDB through Mongoose.
* Save/Load
    * Admin
* Various tidy up on the data model in frontend
    * Potentially move all resolution data to a service as opposed to keeping in controller.
* Tidy up on PDF formatting.
    * Keep investigating other methods
        * jsPDF - Not Suitable
        * Phantomjs
        * Some third party api?
