# Q42-foosball
Digital Foosball entry for the Q42 Hackathon. It consists of trackers,
a server and visualizers.
First some installation notes, afterwards running them.

## Installation - for all
To run the server or the clients you need to copy the root file 
`config.example.json` as `config.json` and change at least the host
of where the server will be running and optionally the port numbers of
the server and clients.
The clients will use the configured server host and port to connect
with the server's websocket communication channel.


## Installation - clients

### TV / Visual client
The heart and soul of the digital foosball table.
navigate to `tv-client` and run

`npm install`

### Controller client (digital referee)
Use an iPhone / iPad / remote Laptop to control the game.
navigate to `controller-client` and run

`npm install`

### VR client
An under construction VR experience from inside the table's
soccer field.
navigate to `vr-client` and run

`npm install`


## Installation - ball trackers
These install notes are for Mac. You need at least the OpenCV for Python
libraries to install the server. If you don't wan to run any tracker
you need to remove the 'opencv' dependency of the server's package.json.

### Prerequisites
Just install one of these 3 prerequisites, dependening on your setup
if you want to track a ball.

#### OpenCV for NodeJS webcam tracking
The [node-opencv](https://github.com/peterbraden/node-opencv) library
only needs OpenCV to be installed which you can do with the following
through the [Brew](http://brew.sh/) package manager.

```

brew update

brew tap homebrew/science

brew install opencv

```

To make sure the brew installed packages are used, make sure
the following is in your PATH

`export PATH=/usr/local/bin:$PATH`

#### OpenCV for Python webcam tracking
To get OpenCV and Python running try installing them with [Brew](http://brew.sh/)

```

brew update

brew install python

brew tap homebrew/science

brew install opencv

 # opencv will also install the python numpy library    

```

To make sure the brew installed packages are used, make sure
the following is in your PATH

`export PATH=/usr/local/bin:$PATH`

You can check this by running:

`which python`

and it should mention `/usr/local/bin/python`

Other Python packages to install:

`pip install imutils`

#### Freenect (the Open Kinect library) for Python Kinect tracking

You don't need the Freenect library if you just want to track something
by using a webcam. If so, just skip ahead to the 'Running the trackers' chapter.

If you just want to check the Kinect connection you can do
 
`brew install freenect` 
and after that and connecting the Kinect run
`freenect-glview` from the command line.

To be able to program in Python with freenect install these prerequisites

```
pip install cython
pip install matplotlib
```

You can first try to run the trackers under `python-trackers/` and if they don't
run you need to replace `python-trackers/freenect.so` with a locally compile one.
To create that one checkout the freenect repository at [https://github.com/OpenKinect/libfreenect](https://github.com/OpenKinect/libfreenect)

Navigate to `wrappers/python`, edit `setup.py` and remove the reference
to `'/usr/local/lib64'`

Install the library locally in that directory with 
`python setup.py build_ext --inplace` and after
that you can move your copy of the freenect module to the `python-trackers/` folder			
			
			
			
## Installation - server

You need NodeJS+NPM and after that navigate to `server/` and run

`npm install`

As already said, if you don't want to track the ball, remove the `opencv`
dependency of the server's package.json before npm installing.

			
## Running the server			
You need to connect the table's Makey Makey USB cable in order to
receive table commands, like goals, reset and theme switching.
After the server is running, navigate to [http://localhost:your_configure_port/admin](http://localhost:your_configure_port/admin)
to be able to control and monitor the table. You need to keep the
mouse focus on this page to be able to receive commands from the table.

### Admin options				
There are buttons for entering a score.

#### S
Score left
				
#### D
Score right

#### W
Change theme

#### A
Reset the score
				
				
Run one of the following commands to run the server.				
			
### No ball tracking

`npm run notracking` if you just want to receive goal, reset and
theme switching input.
			
### Default webcam tracking
Setup table dimensions (in cm) in `trackers/CamTracker.js`
in the variable TABLE_DIMENSIONS.
To track a ball through webcam tracking, connect a webcam and run

`npm run webcam`

After this, go to the admin page and draw a rectangle on the First screen
grab to denote which area is of interest for ball tracking.

			
### Python webcam tracking
After installing all prerequisites, setting TABLE_DIMENSIONS in cm
in `trackers/PythonCamTracker.js` and connecting a webcam run
			
`npm run python:webcam`			

You will see a small popup from Python top left of your screen.
Enter your table dimensions (here as well) and press Save. With your mouse,
draw a rectangle on the screen which will represent your foosball table.
When a ball is tracked in between this rectangle you'll see it's position
being output on screen. 
			
### Python Kinect tracking		
After installing all prerequisites, setting TABLE_DIMENSIONS in cm
in `trackers/PythonCamTracker.js` and connecting a kinect run
			
`npm run python:kinect`			
	
And follow the table setup instructions of the 'Python webcam tracking'
chapter.								
		

			
## Running the clients
Navigate to any one of the client's main folder and do `npm start`.
Clients receive socket events from the table and can send events.

### Sending and Receiving events

#### Receiving (event name, arguments)
ball-positions, reversed array of the last 10 positions (recent one 1st)

score-update, { left: int, right: int }

score-left, { left: int, right: int }

score-right, { left: int, right: int }

change-theme, theme index

get-current-theme, current theme index

get-themes, array of theme strings

reset-game

#### Sending (event name, arguments) 
change-theme, theme index

cycle-theme

get-current-theme
 
get-themes

reset-game

score-left

score-right

subtract-score-left

subtract-score-right
			
			
### Controller Client
The digital referee allows you to score and substract wrongful scores.
			
### TV Client
Connect the table's HDMI cable to the device that runs the TV client
in order to see some wonderful effects :)

..TODO.. info on available keydown controls
			
### VR Client
Currently, not much to do there.			
			
## Debugging
			
### Ball tracking colors			
			
### Running the python trackers manually
			
You can run the tracker by navigating to `python-trackers/` and running the following:
 			
`python ball_tracking.py` for a Webcam tracker

or
 			
`python ball_tracking.py --kinect` for a Kinect tracker 			
			
After that enter your table dimensions and press Save. With your mouse,
draw a rectangle on the screen which will represent your foosball table.
When a ball is tracked in between this rectangle you'll see it's position
being output on screen. 
			
			
			
			