class Group extends Node {

  constructor(id, colour, loops, children = []) {

    if (new.target === Group) {
      throw new TypeError("Cannot construct Group instances directly");
    }

    super(id, colour, loops, setNode);
    this.children = children;
  }

}
