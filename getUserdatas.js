if (!token) {
    localStorage.setItem(
        LOCALSTORAGE_TOKEN,
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI5MjYxMjQ3fQ.XSHHyUa3H0Up8Q4cvWuGJL9YG9YV237z0p2bPO-bYXM"
    );
}

const userdataContainer = document.querySelector("#userdata-container");
const searchForm = document.querySelector("#userdata-search");

const me = () => `{ me {id, createdAt} }`;

const getUserdatas = () => `{ 
	getUserdatas {
    ok
    error
    userdatas {
      id
      datas
    }
  }
}`;

const getUserdatasCompleted = ({ data }) => {
    const {
        getUserdatas: { ok, error, userdatas },
    } = data;

    if (!ok) {
        console.log(error);
        return;
    }

    userdatas.map((userdata) => {
        // console.log(userdata);
        const { id, datas } = userdata;
        const userdataListItem = document.createElement("li");
        userdataListItem.textContent = `[ID: ${id}] : ${datas}`;
        userdataContainer.appendChild(userdataListItem);
    });
};

const getQuery = (ev) => {
    ev.preventDefault();

    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "x-jwt": token,
        },
        body: JSON.stringify({
            query: getUserdatas(),
        }),
    };

    fetch(`https://kaist.edison.re.kr/graphql/`, options)
        .then((res) => res.json())
        .then(getUserdatasCompleted);

    searchForm.reset();
};
searchForm.addEventListener("submit", getQuery);

