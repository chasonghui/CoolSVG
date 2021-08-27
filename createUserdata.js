const LOCALSTORAGE_TOKEN = "virtuallabs-token";
const token = localStorage.getItem(LOCALSTORAGE_TOKEN);

if (!token) {
    localStorage.setItem(
        LOCALSTORAGE_TOKEN,
        "TOKEN HERE"
    );
}

const createForm = document.querySelector("#userdata-create");
const createUserdata = (solverId, datas) => `
mutation {
  createUserdata ( input : {
    solverId : ${solverId},
    datas : ${JSON.stringify(datas)}
  }) {
    ok
    error
  }
}`;

const createUserdataCompleted = ({ data }) => {
    const {
        createUserdata: { ok, error },
    } = data;
    if (!ok) {
        console.log(error);
        return;
    }
    console.log("createUserdataCompleted");
};

const mutation = (ev) => {
    console.log("저장");
    ev.preventDefault();
    const userdata = JSON.stringify(coords);
    const solverId = document.querySelector("#solverId").value;
    const query = createUserdata(solverId, userdata);
    console.log(query);
    // mutation {
    //     createUserdata ( input : {
    //       solverId : 1,
    //       datas : "[object Object]"
    //     }) {
    //       ok
    //       error
    //     }
    //   }
    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "x-jwt": token,
        },
        body: JSON.stringify({ query }),
    };

    fetch(`https://kaist.edison.re.kr/graphql/`, options)
        .then((res) => res.json())
        .then(createUserdataCompleted);

    createForm.reset();
};

createForm.addEventListener("submit", mutation);

