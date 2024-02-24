

window.onload = generateTodos();

function generateTodos(){
    axios.get("/get-todo?skip=0")
    .then((res)=>{
        console.log(res.data.todos);
        renderTodos(res.data.todos);
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

function add(){
    const todo = document.getElementById("create_field").value;
    axios.post("/create-todo", {todo})
    .then((res)=>{
        console.log("todo created",res)
        const container = document.getElementById("item_list")
        const todos = document.createElement("div") 
        todos.id = res.data.data._id
        todos.innerHTML = `
       <div class="todo-container m-2 d-flex justify-content-between p-2"><li >${res.data.data.todo}</li>
        <div><button onclick="handleEdit('${res.data.data._id}')" id="edit_todo">edit</button> <button id="delete_todo" onclick="handleDelete('${res.data.data._id}')">delete</button></div></div>
       `
       container.appendChild(todos)
    })
    .catch(err=>console.log("error", err.message))
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
        var element = document.getElementById(ide);
        var liElement = element.querySelector('li'); // Select the first <li> tag within the element
        liElement.innerText = newTodo;
       // document.getElementById(ide).innerText =newTodo ;
    })
    .catch(err=>console.log("error updating todo"))

    
}

function handleDelete(ide,e){
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