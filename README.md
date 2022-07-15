# Snake-3D_PRIMA_Mantay
Dieses Repository dient dem Abgabe-Projekt "Snake 3D" für das Modul P.R.I.M.A der Hochschule Furtwangen.

## Information zur Abgabe
- Title: Snake 3D
- Author: Tim Mantay
- Year and season: Sommersemester 2022 
- Curriculum and semester: Allgemeine Informatik - 6 Semester
- Course: Prototyping interactive media-applications and games (P.R.I.M.A)
- Docent: Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl

- Finished Project: [Snake 3D - GitHub Pages](https://feinerkuchen567.github.io/Snake-3D/index.html)
- Source code: [Snake 3D - Reposiotory](https://github.com/FeinerKuchen567/Snake-3D)
- Design document: [Konzept](https://github.com/FeinerKuchen567/Snake-3D/tree/master/Konzept)
- Description - how to interact: ---
- Description on how to install: ---

## Checkliste für Leistungsnachweis
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
| Nr | Criterion           | Explanation                                                                                                         |
|---:|---------------------|---------------------------------------------------------------------------------------------------------------------|
|  1 | Units and Positions | 0 ist unten lings - 1 ist bereist der nächste Gridfläche                                                            |
|  2 | Hierarchy           | "Grid" -> "Ground" -> "Grass-Row" -> Element -> "Grass" -- Die Translation des Grids werden gebündelt               |
|  3 | Editor              | Positionierung der 3-Prerson-Kamera kann mit Coding schneller neu angepasst werden als mit dem Vidual Editor        |
|  4 | Scriptcomponents    | Das "hinterher Laufen " des Körpers ist durch eigenes Skript besser umsetzbar als duch bspw. eine Foreach-Schleife  |
|  5 | Extend              | Derive classes from FudgeCore and explain if that was useful in your context or not and why.                        |
|  6 | Sound               | Thema-Sound ist direkt bei der Kamera positioniert umd es durchgehend zu hören zu können.                           |
|  7 | VUI                 | Create a virtual user interface using the interface controller and mutables. Explain the interface.                 |
|  8 | Event-System        | Use the event system to send messages through graphs and explain if that was useful in your context or not and why. |
|  9 | External Data       | Create a configuration file your application loads and adjusts to the content. Explain your choice of parameters.   |
|  A | Light               | Explain your choice of lights in your graphs (1)                                                                    |
|  B | Physics             | Add rigidbody components and work with collisions (1) and/or forces and torques (1) and/or joints (1)               |
|  C | Net                 | Add multiplayer functionality via network (3)                                                                       |
|  D | State Machines      | Create autonomous entities using the StateMachine (1) and/or ComponentStateMachine (1) defined in FudgeAid          |
|  E | Animation           | Animate using the animation system of FudgeCore (1) and/or Sprites (1) as defined in FudgeAid                       |