export function statusComparator(status1, status2) {
  switch (typeof status1) {
    case "string":
      if (status1 === status2) {
        return 0; // both are same status, no need to move them
      } else if (status1 === "Active") {
        return -1; // status1 is Active, status2 is Inactive, move it above whatever is Inactive: Acsending order
      } else {
        return 1; // status1 is Inactive, status2 is Active, move it below: Descsending order
      }
    case "object":
      if (status1.value === status2.value) {
        return 0; // both are same status, no need to move them
      } else if (status1.value) {
        return -1; // status1 is true, status2 is false, move it above whatever is false: Acsending order
      } else {
        return 1; // status1 is false, status2 is true, move it below: Descsending order
      }
  }
}
