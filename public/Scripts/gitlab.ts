const GITLAB_TOKEN = "glpat-mYhwXKb_9ksRbLZG-yrA";
const gitlabHeader = {
  headers: {
    Authorization: `Bearer ${GITLAB_TOKEN}`,
  },
};

async function searchUsers() {
   const url = `https://gitlab.com/api/v4/users?search=${username}`;
   const response = await fetch(url, gitlabHeader);

   if (!response.ok) {
      throw new Error(`Error fetching users: ${response.status}`);
   }

   const users = await response.json();

   
   if (users[0].username === undefined) {
      throw new Error(`User not found: ${username}`);
   }
   else {
      // console.log(`Username: ${JSON.stringify(users)}`);
      return users[0];
   }
}