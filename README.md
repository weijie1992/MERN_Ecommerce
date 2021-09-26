MERN Stack ecommerce website.

React folder contains Client side React code

Node folder contains Server side Nodejs code

View demo on https://

To run this project locally will require below
1) Clone project - npm install on both React and Node Folder
2) Create a mongodb - https://cloud.mongodb.com/
3) AWS account for storing of images
4) Stripe account for making test payment
5) Sendgrid account - optional email will not be trigger for registration and payment
6) Create .env file in React and Node root directory with all environment variable below

<b>Environment Variable for React and Node </b>
<br/>
<b>React .env variable</b>
<br/>
REACT_APP_SERVER_API=
<br/>
REACT_APP_GOOGLE_CLIENT_ID=
<br/>
REACT_APP_FACEBOOK_APP_ID=
<br/>
REACT_APP_AWSS3DIR=
<br/>
REACT_APP_STRIPE_PUBLISHABLE_KEY=
<br/>

<b>Node .env variable</b>
<br/>
NODE_ENV=DEV
<br/>
CLIENT_URL=
<br/>
PORT=
<br/>
MONGO_URL=
<br/>
JWT_ACTIVATEACCOUNT=
<br/>
EMAIL_FROM=
<br/>
SENDGRID_APIKEY=
<br/>
JWT_SIGNIN=
<br/>
JWT_SIGNIN_REFRESH=
<br/>
JWT_FORGETPASSWORD=
<br/>
GOOGLE_CLIENT_ID=
<br/>
GOOGLE_CLIENT_SECRET=
<br/>
FACEBOOK_APP_ID=
<br/>
AWS_DIR_NAME=
<br/>
AWS_REGION=
<br/>
AWS_ACCESS_ID=
<br/>
AWS_ACCESS_KEY=
<br/>
AWS_BUCKET_NAME=
<br/>
STRIPE_SECRET_KEY=
<br/>

<b>Other integrated libraries for React and Node</b>
<br/>
1) React-Redux
2) Boostrap 4
3) Ant Design
4) react-router
5) react-stripe-js
6) react-google-login
7) react-facebook-login
8) jsonwebtoken
9) Stripe
10) Sendgrid
11) AWS S3
12) Google-Auth-Library
13) Facebook Graph API

<b>Upcoming features : </b>
1) Checkout/Cart : Promo code and discounted price
2) Admin page : integrate refund with Stripe
3) User login : Locked user account on multiple fail login
4) Storing Refresh token in http only cookie
5) Postal code APIs when customer key postal code
6) Mobile friendly UI
7) Allow customer to rate product
