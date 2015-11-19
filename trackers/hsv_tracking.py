import cv2
import numpy as np

cap = cv2.VideoCapture(0)

while(1):

	_, frame = cap.read()
	hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

	sensitivity = 100
	lower_white = np.array([180, 255, 255])
	upper_white = np.array([0, 0, 255])

	# Threshold the HSV image to get only white colors
	mask = cv2.inRange(hsv, lower_white, upper_white)
	# Bitwise-AND mask and original image
	res = cv2.bitwise_and(frame,frame, mask= mask)

	cv2.imshow('frame',frame)
	cv2.imshow('mask',mask)
	cv2.imshow('res',res)

	k = cv2.waitKey(5) & 0xFF
	if k == 27:
		break

cv2.destroyAllWindows()