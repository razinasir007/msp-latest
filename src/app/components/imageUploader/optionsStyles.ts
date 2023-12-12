import styled, { css } from "styled-components";
export const MenuContextContainer = styled.div`
  border: 1px solid #030202;
  border-radius: 4px;
  padding: 18px;
  margin: 5px 0;
  box-sizing: border-box;
  background-color: #ffffff; /* White background */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Box shadow */
`;

export const ContextMenu = styled.div`
  position: absolute;
  width: 200px;
  background-color: #ffffff;
  border-radius: 5px;
  box-sizing: border-box;
  ${({ top, left }) => css`
    top: ${top}px;
    left: ${left}px;
  `}
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Box shadow */
  
  ul {
    box-sizing: border-box;
    padding: 10px;
    margin: 0;
    list-style: none;
  }
  ul li {
    padding: 11px 12px;
  }

  /* hover */
  ul li:hover {
    cursor: pointer;
    background-color: #3498db; /* Blue hover effect */
     border-radius: 5px;
  }
`;