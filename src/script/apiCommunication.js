class languagePercentage{
    constructor(language, bytes){
        this.language = language
        this.bytes = bytes
    }
}

var results = document.getElementById('results');
var userName = document.getElementById('userName');
var mails = document.getElementById('mails');
var repoTable = document.getElementById('repoTable');
var languagesTable = document.getElementById('languagesTable');

var accountName;
var apiUrl = "https://api.github.com/";
var emails = [];
var reposResponse;
var languageMap =[];
var totalBytes = 0;

var mailsText = '';
var repoList = ''

function clearVariables(){
    results.style.display = 'none';
    accountName=""
    emails = []
    reposResponse = null
    languageMap = []
    totalBytes = 0
    mailsText = '';
    repoList = ''
}

function getUserInfo(){
    clearVariables();
    accountName = document.getElementById('accountName').value;
    userAction().then(displayResults());
}
   
const userAction = async () => {
    let response = await (await fetch(apiUrl + "users/" + accountName)).json();
    
    handleResponse(response)
}
  
function handleResponse(response){
    handleMails(response);
    getRepos();
} 

const handleMails = async (response) => {
    let mail = response.mail
    if(mail!=null){
        emails.push(mail)
    }
    let emailsResponse = await (await fetch(apiUrl + "users/" + accountName + "/events")).json();
    for(event in emailsResponse){
        let payloadCommits = emailsResponse[event].payload.commits
        for(commit in payloadCommits){
            let author = payloadCommits[commit].author
            let username = emailsResponse[event].actor.display_login
            if(username.toString().toLowerCase()===author.name.toString().toLowerCase()){
                let email = author.email
                if(!emails.includes(email)){
                    emails.push(email)
                    mailsText += '<li class="list-group-item">' + email + '</li>';
                    mails.innerHTML = mailsText;
                }
            }
        }
    }
}

const getRepos = async () => {
    reposResponse = await (await fetch(apiUrl + "users/" + accountName + "/repos")).json();
    computeLanguageStatistics();
}

function computeLanguageStatistics(){
    for(repoJson in reposResponse){
        let repoName = reposResponse[repoJson].name
        repoTable.innerHTML+='<a href="' + reposResponse[repoJson].html_url + '" class="list-group-item">' + repoName + '</a>'
        getRepoLanguages(repoName)
    }
}

const getRepoLanguages = async(repoName) => {
    let repoLanguages = await (await fetch(apiUrl + "repos/" + accountName + "/" + repoName + "/languages")).json();
    for(singleLanguage in repoLanguages){
        byteAmount = repoLanguages[singleLanguage]
        totalBytes += byteAmount
        
        let languageObject = mapHasKey(singleLanguage)
        if(languageObject!=null){
            languageObject.bytes+=byteAmount
        }else{
            languageObject = new languagePercentage(singleLanguage, byteAmount)
        }
        languageMap.push(languageObject)
    }
}

function mapHasKey(key){
    for(language in languageMap){
        if(languageMap[language].language==key){
            return languageMap.splice(language, 1)[0]//first index cause splice returns array when I need just single object
        }
    }
    return null
}

const displayResults = async() => {
    userName.innerHTML = '<h2>' + accountName + '</h2>';

    results.style.display = 'inline';
}