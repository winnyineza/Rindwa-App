# 📱 Rindwa App

> A community-driven emergency response and safety alert mobile application designed to enhance public security in Rwanda.

---

## 🚀 Overview

Rindwa App is a real-time, citizen-centered platform enabling users to report emergencies, verify incidents through community voting, notify emergency contacts, and connect directly with government agencies like the Rwanda National Police. The app leverages mobile-first design and cloud integration to bridge communication gaps in emergency response.

This document summarizes the **initial version** of the solution, fulfilling the requirements for the FullStack track demonstration.

---

## 🎨 Frontend Development

### 🔹 UI/UX Design Process

We followed user-centered design principles and a mobile-first approach using **Figma** for wireframing and mockups. The design ensures quick navigation and usability even in high-stress scenarios.

👉 **[Figma Link to Wireframes & Mockups](https://your-figma-link.com](https://www.figma.com/design/WHGQbwKFd3CVbiRJoLP8JJ/Rindwa-App?node-id=1-3&t=k2Ioh9f5Ubwcpd7b-1))**

### 🔹 Technologies Used

- **React Native (Expo)**
- **TailwindCSS (via NativeWind)**
- **JavaScript (ES6+)**

### 🔹 Features Demonstrated

-   User Authentication (Phone, Email, Google, Apple)
-   Emergency Contact Management & SMS Alerts
-   Incident Reporting (Text, Media, Location)
-   Community Verification System (Voting)
-   Multilingual Support (Kinyarwanda, English, French)
-   Livestreaming
-   Interactive Map & Incident Feed
-   Push Notifications
-   Government Integration (RNP)
-   Admin Dashboard

## Backend Development

### 🔹 Technologies Used

-   Node.js + Express.js
-   PostgreSQL (via Prisma ORM)
-   Firebase Cloud Messaging (for push notifications)
-   Twilio SMS API (for emergency alerts)

## 🌐 Deployment Process

### 🔹 Hosting & Infrastructure
-   Frontend: Expo Go during MVP stage
-   Backend: Node.js hosted on Render (or Firebase Functions)
-   Database: PostgreSQL (Supabase / Railway for free-tier hosting)
-   Push Notifications: Firebase Cloud Messaging
-   SMS: Twilio API (sandbox mode)

### 🔹 Steps
-   Backend deployed via GitHub -> Render CI pipeline
-   Expo published for testing via QR code (TestFlight planned for iOS)
-   Environment variables secured with .env and deployment secrets

## 🎥 Demo Video
👉 [Watch Demo on Google Drive](https://your-figma-link.com](https://www.figma.com/design/WHGQbwKFd3CVbiRJoLP8JJ/Rindwa-App?node-id=1-3&t=k2Ioh9f5Ubwcpd7b-1))

## 📊 Diagrams
👉 [View Diagrams on Excalidraw](https://your-figma-link.com](https://www.figma.com/design/WHGQbwKFd3CVbiRJoLP8JJ/Rindwa-App?node-id=1-3&t=k2Ioh9f5Ubwcpd7b-1)](https://excalidraw.com/#json=bgddnHcDfiAtysJdIrHf3,OALuQXYGSPj_b9OqScSQIA))
