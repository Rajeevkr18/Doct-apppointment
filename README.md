# 🏥 Doctor Appointment System

A full-stack **Doctor Appointment System** built using the **MERN stack**, designed to streamline patient–doctor interactions, appointment scheduling, and healthcare record management.  
The application is **Dockerized** and deployed using **Ansible automation**, enabling consistent, repeatable, and scalable deployments.

---

## 🔹 Overview

This system allows patients to book and manage appointments, doctors to manage schedules and prescriptions, and administrators to oversee platform operations.  
It follows a modular REST architecture and integrates DevOps best practices through containerization and infrastructure automation.

---

## 🚀 Key Features

- Role-based authentication (Patient, Doctor, Admin)
- Appointment booking, rescheduling, and management
- Doctor profile and availability management
- Prescription and medical document handling
- Health records and analytics APIs
- Secure RESTful backend using Express
- Responsive React frontend
- Dockerized application services
- Fully automated deployment using Ansible

---

## 🛠 Tech Stack

**Frontend:** React.js, Bootstrap, Ant Design, Axios  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**DevOps & Tools:** Docker, Docker Compose, Ansible, Git, GitHub, Postman

 
---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
````

---

## ▶️ Run Locally (Development)

```bash
git clone https://github.com/Rajeevkr18/Doct-apppointment.git
cd Doct-apppointment
npm install
cd client && npm install
npm run dev
```

* Backend: [http://localhost:8080](http://localhost:8080)
* Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🤖 Deployment with Ansible (Recommended)

The complete deployment is automated using **Ansible**.
Manual Docker commands are **not required**.

### 🔧 Prerequisites

* Ansible installed on the local machine
* SSH access to the target server

---

### 🚀 Automated Deployment

From the project root:

```bash
cd ansible
ansible-playbook playbooks/setup.yml
ansible-playbook playbooks/deploy.yml
```

---

### 🌐 Application Access

After deployment:

* Backend: `http://<server-ip>:8080`
* Frontend: `http://<server-ip>:3000`

---

### 🔁 Redeployment

After code changes, redeploy using:

```bash
ansible-playbook playbooks/deploy.yml
```

---

## 🐳 Docker (Managed by Ansible)

Docker and Docker Compose are used internally, but all container operations are orchestrated by Ansible to ensure reliability and repeatability.

---

## 📌 Use Cases

* Hospital and clinic appointment systems
* Telemedicine platforms
* Healthcare management solutions
* MERN + DevOps portfolio project

---

## 👨‍💻 Author

**Rajeev Kumar**
GitHub: [https://github.com/Rajeevkr18](https://github.com/Rajeevkr18)
LinkedIn: [https://www.linkedin.com/in/rajeevk18/](https://www.linkedin.com/in/rajeevk18/)

---

## ⭐ Highlights

* Built a scalable MERN application with clean REST APIs
* Implemented role-based access and secure data handling
* Containerized the application using Docker
* Automated end-to-end deployment using Ansible

```

