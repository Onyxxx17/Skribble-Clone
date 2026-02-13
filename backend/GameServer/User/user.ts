export class User {
  id: string;
  username: string;
  correctlyGuessed: boolean;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
    this.correctlyGuessed = false;
  }
}
