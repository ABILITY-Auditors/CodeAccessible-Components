# CodeAccessible Repo Guide
## How to Fork, Clone, and Make Pull Requests

###### By Justin Aquino
### Main Overview 
## Step 1: Fork the Repository.
  Developing a solo project is completely different from collaborating with a team. 
There is a specific workflow one should follow when contributing to a project in Github. 
Forking will create a copy of the project in your own Github account, and it will allow the developers to make changes to the code while ensuring that these changes do not affect the original repository. 
You can do so by clicking the Fork button on the right side of the repo. 

If the forking is successful, it will create a new repository under your account.


## Step 2: 

Step 2: Clone the Project
  Next, you need to clone your forked repo to your local machine to start making changes to the project. Click on the Code drop down button on your forked repository, and copy your preferred cloning web URL. I prefer using HTTPS.

Run this command in your CLI or Terminal: ```git clone <repo_url>```

## Step 3: Add Remote Upstream
  The changes you made are now reflected in the original repository, and everyone working on the same repository will now have to update their local repository before pushing their own changes. Same thing applies to you when someone else makes a PR before you do. In order to do so, you have to add a remote upstream. It is similar to adding a remote origin. 

  To check the origin of your local repository, run this command in your CLI or Terminal: 

  ```git remote -v```
