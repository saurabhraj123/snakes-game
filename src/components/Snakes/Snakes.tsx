/** External */
import { useState, useEffect, useRef } from "react";

/** Css */
import classes from "./Snakes.module.css";

type Position = {
  x: number;
  y: number;
};

const Snakes = () => {
  const containerRef = useRef(null);

  const [foodLocation, setFoodLocation] = useState<Position>({
    x: 40,
    y: 20,
  });

  const [snakeLocations, setSnakeLocations] = useState<Position[]>([
    { x: 20, y: 10 },
    { x: 10, y: 10 },
  ]);

  const [speed, setSpeed] = useState<number>(1);
  const [direction, setDirection] = useState<string>("right");
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false); // New state for game over

  useEffect(() => {
    const interval = setInterval(() => {
      const newSnakeLocations = [...snakeLocations];
      const newSnakeLocation = { ...newSnakeLocations[0] };

      // Move snake head
      switch (direction) {
        case "right":
          newSnakeLocation.x += 10;
          break;
        case "left":
          newSnakeLocation.x -= 10;
          break;
        case "up":
          newSnakeLocation.y += 10;
          break;
        case "down":
          newSnakeLocation.y -= 10;
          break;
      }

      // Check if snake touches itself
      const hasTouchedItself = newSnakeLocations.some(
        (segment, index) =>
          index !== 0 &&
          segment.x === newSnakeLocation.x &&
          segment.y === newSnakeLocation.y
      );

      if (hasTouchedItself) {
        setGameOver(true); // Trigger game over
        return; // Exit early
      }

      newSnakeLocations.unshift(newSnakeLocation);

      // If the snake is out of bounds, wrap it around
      if (containerRef.current) {
        const containerRect = (
          containerRef.current as HTMLElement
        ).getBoundingClientRect();

        if (newSnakeLocation.x >= containerRect.width - 10) {
          newSnakeLocation.x = 0;
        } else if (newSnakeLocation.y >= containerRect.height - 10) {
          newSnakeLocation.y = 0;
        } else if (newSnakeLocation.x < 0) {
          newSnakeLocation.x = containerRect.width - 12;
        } else if (newSnakeLocation.y < 0) {
          newSnakeLocation.y = containerRect.height - 10;
        }

        // Check if the snake has eaten the food
        if (
          Math.abs(
            Math.floor(newSnakeLocation.x) - Math.floor(foodLocation.x)
          ) <= 5 &&
          Math.abs(
            Math.floor(newSnakeLocation.y) - Math.floor(foodLocation.y)
          ) <= 5
        ) {
          setFoodLocation({
            x: Math.floor(Math.random() * containerRect.width),
            y: Math.floor(Math.random() * containerRect.height),
          });
          setScore((prevScore) => prevScore + speed * 10);

          if (speed < 3) setSpeed((prevSpeed) => prevSpeed + 1);
        } else {
          newSnakeLocations.pop();
        }

        setSnakeLocations(newSnakeLocations);
      }
    }, 200 / speed);

    return () => {
      clearInterval(interval);
    };
  }, [speed, direction, snakeLocations, foodLocation]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver) return; // Prevent further input after game over
      switch (event.key) {
        case "ArrowUp":
          if (direction !== "down") setDirection("up");
          break;
        case "ArrowDown":
          if (direction !== "up") setDirection("down");
          break;
        case "ArrowLeft":
          if (direction !== "right") setDirection("left");
          break;
        case "ArrowRight":
          if (direction !== "left") setDirection("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [direction, setDirection, gameOver]); // Include gameOver dependency to prevent input after game ends

  return (
    <div className={classes.container} ref={containerRef}>
      {gameOver ? (
        <div className={classes.gameOver}>Game Over</div>
      ) : (
        <>
          {snakeLocations.map((snakeLocation) => {
            return (
              <div
                key={`${snakeLocation.x}-${snakeLocation.y}`}
                style={{ left: snakeLocation.x, bottom: snakeLocation.y }}
                className={classes.snakeBox}
              />
            );
          })}

          <div
            style={{ left: foodLocation.x, bottom: foodLocation.y }}
            className={classes.foodBox}
          />

          <div className={classes.score}>{score}</div>
        </>
      )}
    </div>
  );
};

export default Snakes;
