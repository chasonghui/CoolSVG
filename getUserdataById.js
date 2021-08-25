const LOCALSTORAGE_TOKEN = "virtuallabs-token";
const token = localStorage.getItem(LOCALSTORAGE_TOKEN);

if (!token) {
    localStorage.setItem(
        LOCALSTORAGE_TOKEN,
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MjYxMjQ3fQ.XSHHyUa3H0Up8Q4cvWuGJL9YG9YV237z0p2bPO-bYXM"
    );
}

const userdataContainer = document.querySelector("#userdata-container");
const searchForm = document.querySelector("#userdata-search");

const me = () => `{ me {id, createdAt} }`;

const getUserdataById = (id) => `{
  getUserdatasById(input:{
    userdataId : ${id}
  }) {
    ok
    error
    userdata {
      id
      datas
    }
  }
}`;

const getProfile = ({ data }) => {
    const {
        getUserdatasById: { ok, error, userdata },
    } = data;

    if (!ok) {
        console.log(error);
        return;
    }
    const { id, datas } = userdata;

    const userdataListItem = document.createElement("li");
    userdataListItem.textContent = `[ID: ${id}] : ${datas}`;

    userdataContainer.appendChild(userdataListItem);
};

const getQuery = (ev) => {
    ev.preventDefault();
    const keyword = searchForm.elements["search"].value;

    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "x-jwt": token,
        },
        body: JSON.stringify({
            query: getUserdataById(keyword),
        }),
    };

    fetch(`https://kaist.edison.re.kr/graphql/`, options)
        .then((res) => res.json())
        .then(getProfile);

    searchForm.reset();
};
searchForm.addEventListener("submit", getQuery);

