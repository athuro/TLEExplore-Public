# SDI Blended Project 1 Scaffold
The application contained in this repo was created to offer users a way to find an visualize Two Line Elements (TLEs) for tracked objects in space. In its current edition, the application offers users a direct search page as well as a page to sort all tracked objects based on a specific inclination, eccentricity, or period filter. The TLE set used for this application is retrieved from the TLE API provided by CelesTrak 

# Running the application
To run this application, simply download the contents of the repo and open one of the html files in the pages folder in Chrome.

# Using the TLEExplorer Page
To use the main page of the application, users begin by searching for a tracked object. This can be accomplished by typing the satellite name or NORAD 5 character ID into the sarch bar, or clicking the 'Explore Starlink' button (for users who don't have a particular object in mind). While the search is running a spinning globe loader will appear in the top right corner. Once the fetch is complete, data pulled directly from the TLE will automatically fill the result section of the page, along with parameters calculated using the TLE. These parameters are then displayed in the table.

An orbit track and point will appear on the globe viewer powered by Cesium. This viewer allows users to simulate the path of the object over time. The accuracy of orbit propogation based on the data from each TLE depends primarily on the time passed since epoch. For TLEs with recent epochs (in the last week), the propogation is resonably accurate. Inside the top right of the viewer, users can change the baselayer rendering style and the type of map. At the bottom left, users can start, pause, and manipulate the speed of the simulation. Each new object search will add a new object and path to the viewer, but overwrite the data in the table. To clear all objects simply click 'Clear Viewer'. If more than one orbit of a particular object is desried, press the 'Add Pass' button to create and add the next orbit of the same object. Multiple objects and multiple orbit passes can be compared in this manner. 

# Using the API Sat List page
To use the secondary page of the application, users must use one of three search bars. The first filters by inclination, the second by eccentricity, and the third be orbital period. In all cases, the user input must start with either the greater then (>) or less then (<) symbols. Then simply click on the search bars associated submit button and a table with as many as 20 rows will be generated. Users can then change the sort direction using the 'Ascending' and 'Descending' buttons in the top left of the result section. Users can also move to the next page of results (if present) using the buttons in the top right of the result section. 

# Error handling
On both pages, if the user's input is not a valid format an error popup will appear. To clear this error, click on the popup. In the case that a valid search is made and the fetch still fails, a popup explaining the reason should appear. 

Some of the objects in the TLE database have epochs several years in the past and low altitudes. It is highly likely that these objects have since deorbited; in this case the viewer does not render the current position and orbit of the object, but the table is still filled. 

# TLEExplore-Public
