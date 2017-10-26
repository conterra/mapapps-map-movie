# Map Movie App Template
This app template allows you to create really cool apps, that show different maps in a nice filmstrip to a user. A user can run the "map movie" automatically or cross-fade maps manually.

The template also shows a prototype of a new way of configuring an app (by clicking different elements in the template to configure them). Your own map services can be added to the app in a very easy way (restriction is, that you use tiled services in EPSG:3857). You need map.apps 3.2.0 to use this template.

![Screenshot Map Movei Sample app](https://github.com/conterra/mapapps-map-movie-template/blob/master/mapMovie.JPG)

Sample App
------------------
https://demos.conterra.de/mapapps/resources/apps/downloads_mapmovie/index.html

Development Guide
------------------
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

##### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`

