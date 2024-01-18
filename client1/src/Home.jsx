import React, { useState, useEffect,useContext } from "react";
import UserContext from "./UserContext";
import axios from 'axios';

function Home() {
  const userInfo = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentFilterCategory, setCurrentFilterCategory] = useState("");
  const apiUrl = "http://localhost:5500/api/tasks";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!userInfo.email) {
          throw new Error("You need to be logged in to see this page");
        }
        const response = await axios.get(apiUrl, { withCredentials: true });
        if (response.status === 200) {
          const data = response.data;
          const tasksArray = Array.isArray(data) ? data : [data];
          setTasks(tasksArray);
        } else {
          console.error(`API request failed with status: ${response.status}`, response.data);
          throw new Error(`Failed to fetch data (Status: ${response.status})`);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
    };
fetchTasks();
  }, [userInfo.email]);
  
  const handleFilterCategoryChange = (e) => {
    setCurrentFilterCategory(e.target.value);
  };
  const handleDescriptionChange = (e) => {
    setCurrentDescription(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCurrentCategory(e.target.value);
  };
 
  const handleChange = (e) => {
    setCurrentTask(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        task: currentTask,
        description: currentDescription,
        category: currentCategory,
      };
      const response = await axios.post(apiUrl, newTask, { withCredentials: true });

    if (response.status === 200 || response.status === 201) {
    setTasks((prevTasks) => [...prevTasks, response.data]);
    setCurrentTask("");
    setCurrentDescription("");
    setCurrentCategory("");
    } else {
      console.error(`API request failed with status: ${response.status}`, response.data);
      throw new Error(`Failed to add task (Status: ${response.status})`);
    }
    }catch (error) {
    console.log(error);
  }
  }
 
  const handleUpdate = async (currentTaskId) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task._id === currentTaskId
          ? { ...task, completed: !task.completed }
          : task
      );
      setTasks(updatedTasks);
      await axios.put(apiUrl + "/" + currentTaskId, { completed: !currentTask.completed });
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (currentTaskId) => {
    try {
      await axios.delete(apiUrl + "/" + currentTaskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== currentTaskId));
    } catch (error) {
      console.log(error);
    }
    
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text"
          value={currentTask}
          onChange={handleChange}
          placeholder="Task/Title"
        />
        <input type="text"
          value={currentDescription}
          onChange={handleDescriptionChange}
          placeholder="Description"
        />
        <input type="text"
          value={currentCategory}
          onChange={handleCategoryChange}
          placeholder="Category"
        />
        <button type="submit">Add Task</button>
      </form>
      <input type="text"
        value={currentFilterCategory}
        onChange={handleFilterCategoryChange}
        placeholder="Filter by category"
      />
      <div>
        <table>
          <thead>
            <tr>
              <th>Complete</th>
              <th>Task/Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.filter((task) => currentFilterCategory
              ? task.category.toLowerCase().includes(currentFilterCategory.toLocaleLowerCase())
              : true
            )
              .map((task) => (
                <tr key={task.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleUpdate(task.id)}
                    />
                  </td>
                  <td className={task.completed ? "completed" : ""}>{task.task}</td>
                  <td className={task.completed ? "completed" : ""}>{task.description}</td>
                  <td className={task.completed ? "completed" : ""}>{task.category}</td>
                  <td>
                    <button onClick={() => handleDelete(task._id)}>Delete </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;