

window.onload = generateTodos();

function generateTodos(){
    axios.get("/get-todo")
    .then((res)=>{
        console.log(res.data);
        renderTodos(res.data);
    })
    .catch((err)=>console.log(err))
}

function renderTodos(arr){
    const container = document.getElementById("item_list")
    arr.map((ele)=>{
       const todos = document.createElement("div") 
       todos.id = ele._id
       todos.innerHTML = `
       <div class="todo-container m-2 d-flex justify-content-between p-2"><li >${ele.todo}</li>
        <div><button onclick="handleEdit('${ele._id}')" id="edit_todo">edit</button> <button id="delete_todo" onclick="handleDelete('${ele._id}')">delete</button></div></div>
       `
       container.appendChild(todos)
    })
}

function handleEdit(ide){
    const newTodo = prompt("please type the new todo");
    const reqBody = {
        id:ide,
        newtodo: newTodo
    }

    axios.put("/edit-todo", reqBody)
    .then((res)=>{
        console.log("todoedited")
        document.getElementById(ide).innerText = newTodo;
    })
    .catch(err=>console.log("error updating todo"))

    
}

function handleDelete(ide){
    console.log("delete triggered")
    const requestBody = {
        id:ide
    }
    axios.post("/delete-todo", requestBody)
    .then((res)=>{
        console.log(res)
        document.getElementById(ide).remove()
    })
    .catch((err)=>console.log(err))
    // window.location.reload();
}