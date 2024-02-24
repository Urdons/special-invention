let userData; // global variable
let username = "";
let totalStars = 0;
let languages = [];
const TOKEN = "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";
let header = {
    'headers': {
        'Authorization': `token ${TOKEN}`
    }
}

async function getRateLimit() {
    const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
            Authorization: `token ${TOKEN}`,
        },
    });

    if (response.ok) {
        const data = await response.json();
    } else {
        console.error('Error fetching rate limit:', response.statusText);
    }
}

getRateLimit();

function newUsername() {
    username = document.getElementById("username").value;
    localStorage.setItem("savedUsername", JSON.stringify(username));
    getUserInfo();
}

async function getUserInfo() {
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
}

window.addEventListener("load", () => {
    if (localStorage.getItem("savedUsername")) {
        username = JSON.parse(localStorage.getItem("savedUsername"));
        getUserInfo();
    }
});

function updateData() {
    document.querySelector(".user-info").classList.remove("hidden");
    document.querySelector(".profile-picture").src = userData.avatar_url;
    document.querySelector(".profile-name").textContent = userData.name;
    document.querySelector(".profile-handle").textContent = userData.login;
    document.querySelector(".profile-desc").textContent = userData.bio;

    document.querySelector(".profile-repos").textContent = userData.public_repos;

    document.querySelector(".profile-followers").textContent = userData.followers;
    document.querySelector(".profile-following").textContent = userData.following;


    document.querySelector(".profile-location").textContent = userData.location;
    document.querySelector(".profile-email").textContent = userData.email;
    document.querySelector(".profile-website").textContent = "Personal Website";
    document.querySelector(".profile-github").textContent = "Github Profile";
    document.querySelector(".profile-website").href = userData.blog;
    document.querySelector(".profile-github").href = userData.html_url;
}

async function getRepoStars(repos) {
    for (const repo of repos) {
        const repoResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}`, header);
        const repoData = await repoResponse.json();
        totalStars += repoData.stargazers_count;
    }

    document.querySelector(".profile-stars").textContent = totalStars;
    return totalStars;
}


async function getRepoLangs(repos) {
    let langs = {};

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

    let sortedLangs = [];
    for (var lang in langs) {
        languages.push([lang, langs[lang]]);
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
    langList.innerHTML = "";
    for (const lang of languages) {
        const langElement = document.createElement("li");
        langElement.textContent = `${lang[0]}: ${lang[1]}%`;
        langElement.classList.add("inline-block", "bg-zinc-700", "px-2", "m-1", "py-1", "rounded-lg");
        langList.appendChild(langElement);
    }
}

function updateGithubStats() {
    console.log(`Username: ${username}`);
    document.querySelector(".github-stats").innerHTML = `<picture>
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