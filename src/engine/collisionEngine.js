const SPRITE_WIDTH = 80; 
const SPRITE_HEIGHT = 80;
const SCALE = 5;

export function checkCollision(A, B) {
  const Ax = A.x * SCALE;
  const Ay = A.y * SCALE;
  const Bx = B.x * SCALE;
  const By = B.y * SCALE;

  const A_left = Ax - SPRITE_WIDTH / 2;
  const A_right = Ax + SPRITE_WIDTH / 2;
  const A_top = Ay - SPRITE_HEIGHT / 2;
  const A_bottom = Ay + SPRITE_HEIGHT / 2;

  const B_left = Bx - SPRITE_WIDTH / 2;
  const B_right = Bx + SPRITE_WIDTH / 2;
  const B_top = By - SPRITE_HEIGHT / 2;
  const B_bottom = By + SPRITE_HEIGHT / 2;

  return !(
    A_right < B_left ||
    A_left > B_right ||
    A_bottom < B_top ||
    A_top > B_bottom
  );
}
