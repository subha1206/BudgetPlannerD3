const form = document.querySelector("form");
const name = document.querySelector("#name");
const cost = document.querySelector("#cost");
const error = document.querySelector("#error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (name.value && cost.value) {
    const item = {
      name: name.value,
      cost: parseInt(cost.value),
    };
    db.collection("expenses")
      .add(item)
      .then((res) => {
        error.textContent = "Your item is added";
        name.value = "";
        cost.value = "";
      });
  } else {
    error.textContent = "Please Enter Some value";
  }
});
