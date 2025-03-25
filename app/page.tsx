"use client"

import { useState, useEffect } from "react"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "@/amplify/data/resource"
import "./../app/app.css"
import { Amplify } from "aws-amplify"
import outputs from "@/amplify_outputs.json"
import "@aws-amplify/ui-react/styles.css"

Amplify.configure(outputs)

const client = generateClient<Schema>()

export default function App() {
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([])

    function listTodos() {
        client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        })
    }

    useEffect(() => {
        listTodos()
    }, [])

    function createTodo() {
        const content = window.prompt("Todo content")
        const priority = Number(window.prompt("Todo priority (1-5)"))

        if (content) {
            client.models.Todo.create({
                content,
                completed: false,
                priority: priority || 1,
            })
        }
    }

    function deleteTodo(id: string) {
        client.models.Todo.delete({ id })
    }

    function updateTodo(id: string) {
        const newContent = window.prompt("Update todo content")
        if (newContent) {
            client.models.Todo.update({ id, content: newContent })
        }
    }

    function toggleCompleted(id: string, completed: boolean) {
        client.models.Todo.update({ id, completed: !completed })
    }

    return (
        <main>
            <h1>My todos</h1>
            <button onClick={createTodo}>+ new</button>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id} style={{ display: "flex", justifyContent: "space-between", gap: "1em", alignItems: "center" }}>
                        <input type="checkbox" checked={!!todo.completed} onChange={() => toggleCompleted(todo.id, !!todo.completed)} />
                        <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                            {todo.content} (Priority: {todo.priority ?? "N/A"})
                        </span>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: ".5em" }}>
                            <button style={{ backgroundColor: "green" }} onClick={() => updateTodo(todo.id)} disabled={!!todo.completed}>
                                Edit
                            </button>
                            <button style={{ backgroundColor: "tomato" }} onClick={() => deleteTodo(todo.id)}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    )
}
