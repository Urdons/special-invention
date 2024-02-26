let userData; // global variable
let username: string = "";
let totalStars: number = 0;
let languages: [string, number][] = [];
let TOKEN: string;
let tokenRecieved : boolean = false;
let header;

getToken("github");

async function getToken(service) {
   console.log('Fetching token...');
   const response = await fetch(`/token/${service}`);
   if (response.ok) {
      const token = await response.text() as string;
      tokenRecieved = true;
      console.log("Token received.");
      TOKEN = token;
      header = {
         'headers': {
            'Authorization': `token ${TOKEN}`
         }
      }
   } else {
      console.error('Error fetching token:', response.statusText);
   }
}


function newUsername() {
   let usernameElement = document.getElementById("username") as HTMLInputElement;
   if (usernameElement) {
      username = usernameElement.value;
      localStorage.setItem("savedUsername", JSON.stringify(username));
      getUserInfo();
   }
}

const usernameInput = document.getElementById("username");
if (usernameInput) {
   usernameInput.addEventListener("keydown", function (event) {
      if (event.key == "Enter") {
         newUsername();
      }
   });
}

async function getUserInfo() {
   if (!tokenRecieved) {
      console.log('Waiting for token to be received...');
      setTimeout(getUserInfo, 200);
      return;
   }
   console.log(tokenRecieved, TOKEN, header)

   try {
      const response = await fetch(`https://api.github.com/users/${username}`, header);
      if (response.ok) {
         userData = await response.json();
         updateData();
         updateGithubStats();
      } else {
         console.error("Failed to fetch user data. Status:", response.status);
      }
   }
   catch (error) {
      console.log(error)
   }

   try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`, header);
      const repos = await response.json();

      getRepoStars(repos);
      getRepoLangs(repos);
   } catch (error) {
      console.error('Error fetching data:', error);
   }
   searchUsers();
}


window.addEventListener("load", () => {
   if (localStorage.getItem("savedUsername")) {
      username = JSON.parse(localStorage.getItem("savedUsername") as string);
      getUserInfo();
   }
});

function updateData() {
   (document.querySelector(".user-info") as HTMLElement).classList.remove("hidden");
   (document.querySelector(".profile-picture") as HTMLImageElement).src = userData.avatar_url;
   (document.querySelector(".profile-name") as HTMLElement).textContent = userData.name;
   (document.querySelector(".profile-handle") as HTMLElement).textContent = userData.login;
   (document.querySelector(".profile-desc") as HTMLElement).textContent = userData.bio;

   (document.querySelector(".profile-repos") as HTMLElement).textContent = userData.public_repos;

   (document.querySelector(".profile-followers") as HTMLElement).textContent = userData.followers;
   (document.querySelector(".profile-following") as HTMLElement).textContent = userData.following;


   (document.querySelector(".profile-location") as HTMLElement).textContent = userData.location;
   (document.querySelector(".profile-email") as HTMLElement).textContent = userData.email;
   (document.querySelector(".profile-website") as HTMLAnchorElement).textContent = "Personal Website";
   (document.querySelector(".profile-github") as HTMLAnchorElement).textContent = "Github Profile";
   (document.querySelector(".profile-website") as HTMLAnchorElement).href = userData.blog;
   (document.querySelector(".profile-github") as HTMLAnchorElement).href = userData.html_url;
}

async function getRepoStars(repos) {
   for (const repo of repos) {
      const repoResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}`, header);
      const repoData = await repoResponse.json();
      totalStars += repoData.stargazers_count;
   }

   (document.querySelector(".profile-stars") as HTMLElement).textContent = totalStars.toString();
   return totalStars;
}


async function getRepoLangs(repos) {
   let langs = {};
   languages = [];

   for (const repo of repos) {
      const repoResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`, header);
      const repoData = await repoResponse.json();

      for (const lang in repoData) {
         if (langs.hasOwnProperty(lang)) {
            langs[lang] += repoData[lang];
         } else {
            langs[lang] = repoData[lang];
         }
      }
   }

   let sortedLangs: [string, number][] = [];
   for (let lang in langs) {
      languages.push([lang, langs[lang]] as [string, number]);
   }

   languages.sort(function (a, b) {
      return b[1] - a[1];
   });


   const total = languages.reduce((acc, curr) => acc + curr[1], 0);
   const percentLanguages = languages.map(lang => [lang[0], Math.round((lang[1] / total) * 100)]);

   generateLanguageElements(percentLanguages);

   return languages;
}

function generateLanguageElements(languages) {
   const langList = document.querySelector(".profile-langs");
   if (langList) {
      langList.innerHTML = "";
      for (const lang of languages) {
         const langElement = document.createElement("li");
         langElement.textContent = `${lang[0]}: ${lang[1]}%`;
         langElement.classList.add("inline-block", "bg-zinc-700", "px-2", "m-1", "py-1", "rounded-lg");
         langList.appendChild(langElement);
      }
   }
}

function updateGithubStats() {
   console.log(`Username: ${username}`);
   const githubStatsElement = document.querySelector(".github-stats");
   if (githubStatsElement) {
      githubStatsElement.innerHTML = `<picture>
         <source
            srcset="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=slateorange"
            media="(prefers-color-scheme: dark)"
         />
         <source
            srcset="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true"
            media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"
         />
         <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true" />
      </picture>`;
   }
}

async function getRateLimit() {
   const response = await fetch('https://api.github.com/rate_limit', header);

   if (response.ok) {
      const data = await response.json();
   } else {
      console.error('Error fetching rate limit:', response.statusText);
   }
}