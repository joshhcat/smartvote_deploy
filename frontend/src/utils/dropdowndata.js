const dep_positions = [
  { id: 1, name: "President" },
  { id: 2, name: "Vice President" },
  { id: 3, name: "Secretary" },
  { id: 4, name: "Treasurer" },
  { id: 5, name: "MMO" },
  { id: 6, name: "Representatives" },
];
const ssg_positions = [
  { id: 1, name: "President" },
  { id: 2, name: "Vice President" },
  { id: 3, name: "Secretary" },
  { id: 4, name: "Treasurer" },
  { id: 5, name: "Auditor" },
  { id: 6, name: "MMO" },
];

class dropdowndata {
  getDepPositions() {
    return dep_positions;
  }
  getSsgPositions() {
    return ssg_positions;
  }
}

export default new dropdowndata();
