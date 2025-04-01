# Chess Bard AI

Chess Bard AI is an interactive chess application where you can play against various AI language models. The application combines traditional chess gameplay with modern AI capabilities to create a unique gaming experience.

## Project Images

<p align="center">
  <img src="public/project images/home-page.png" width="150">
  <img src="public/project images/login.png" width="150">
  <img src="public/project images/signup.png" width="150">
</p>

<p align="center">
  <img src="public/project images/Before match.png" width="150">
  <img src="public/project images/live-match.png" width="150">
  <img src="public/project images/select.png" width="150">
</p>

<p align="center">
  <img src="public/project images/AI thinking.png" width="150">
</p>


## Features

- Play chess against different AI language models and human
- Interactive chessboard with move validation
- Move history tracking
- Game controls (flip board, new game, undo move)
- User authentication (Database not impleted due to time constraint)



## MileStones Achieved

- [x] Develop a functional chessboard UI (2 humans playing against each other on the same device) with legal move validation (i.e., implement all chess rules).
- [x] Replace one human with an LLM agent that can play the moves against the human.
- [x] Allow the human player to choose which LLM they want to play against (e.g., Gemini, OpenAI GPT, Cohere, etc.).

Follow these steps to setup the project locally:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/Aditya-PS-05/chess-bard.git

# Step 2: Navigate to the project directory.
cd chess-bard

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS