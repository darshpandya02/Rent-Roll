import styled from "styled-components";
import { Link as LinkS } from "react-scroll";

export const ButtonT = styled(LinkS)`
  border-radius: 50px;
  background: ${({ primary }) => (primary ? "#4B0082df" : "#010606")};
  white-space: nowrap;
  padding: ${({ big }) => (big ? "14px 48px" : "12px 30px")};
  color: ${({ dark }) => (dark ? "#fff" : "#4B0082df")};
  font-size: ${({ fontBig }) => (fontBig ? "20px" : "16px")};
  outline: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2 ease-in-out;

  &:hover {
    transition: all 0.2 ease-in-out;
    background: ${({ primary }) => (primary ? "#fff" : "#4B0082df")};
  }
`;
