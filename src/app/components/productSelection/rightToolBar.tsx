import React from "react";
import { Flex, Box, Divider, HStack } from "@chakra-ui/react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { BsCartPlusFill } from "react-icons/bs";
import { AiFillTag, AiOutlineAppstoreAdd } from "react-icons/ai";
import { RxDimensions, RxWidth } from "react-icons/rx";
import { IoColorPaletteSharp, IoOptionsSharp } from "react-icons/io5";
import { SlFrame } from "react-icons/sl";
import { CalibrateModal } from "./calibrateModal";
import { ToolLocationScreens } from "./toolLocationScreens";
import { defaultWidths } from "../../../constants";

export const RightToolBar = ({
  heightMainView,
  isOpen,
  selectedImage,
  switchView,
  addProduct,
  activeProduct,
  handleProductClick,
  props,
  productReservedOptions,
  productRegularOptions,
  size,
  frame,
  matting,
  handleReservedOptionsClick,
  handleRegularOptionsClick,
  setFrameWidth,
  frameWidth,
  setWidthView,
}) => {
  const menuButtonStyle = {
    button: () => {
      return {
        paddingRight: "6px",
        borderRadius: "4px",
        height: "35px",
        width: "100%",
        transition: "background-color 0.3s", // Add a transition for smooth hover effect
        backgroundColor: "initial",
        color: "#FFFFFF",
        // Hover style
        ":hover": {
          backgroundColor: "white",
          color: "#121212",
        },
      };
    },
  };

  const regOptionsMenuItemStyles = {
    backgroundColor: "transparent",
    height: "35px",
    color: "#FFFFFF",
  };

  const regOptionsMenuItemRootStyles = {
    ":hover": {
      backgroundColor: "transparent", // Set your desired hover background color here
    },
  };

  const subMenuButtonStyle = {
    borderBottom: "1px solid lightGray",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "0px",
  };

  const subMenuInnerButtonStyle = {
    height: "25px",
    backgroundColor: "#121212",
    color: "white",
    transition: "background-color 0.3s",
    ":hover": {
      backgroundColor: "white",
      color: "#121212",
    },
  };

  return (
    <Flex px='4px' height='100%'>
      <Sidebar
        backgroundColor='#121212'
        collapsed={!isOpen}
        rtl={true}
        className='sidebar-container-class'
        style={{
          height: "100%",
          borderLeft: "none",
        }}
      >
        <Menu menuItemStyles={menuButtonStyle}>
          <Flex direction='column' minH='100%'>
            {selectedImage && (
              <MenuItem
                color='#FFFFFF'
                icon={<BsCartPlusFill size='1.6em' />}
                onClick={addProduct}
              >
                Add product
              </MenuItem>
            )}

            <CalibrateModal />
            <ToolLocationScreens />

            {props.productsDetails?.length > 0 ? (
              <SubMenu
                style={subMenuButtonStyle}
                title={"Products"}
                label={
                  activeProduct ? `Product (${activeProduct})` : "Products"
                }
                icon={<AiFillTag size='1.2rem' />}
              >
                <Box
                  overflowY='auto'
                  backgroundColor={"#121212"}
                  height='100px'
                >
                  {props.productsDetails
                    ?.filter((ele) => ele?.status?.label === "Active")
                    .map((ele, index) => {
                      return (
                        <MenuItem
                          key={index}
                          style={subMenuInnerButtonStyle}
                          active={activeProduct == ele.title && true}
                          onClick={() => handleProductClick(ele)}
                        >
                          {ele.title}
                        </MenuItem>
                      );
                    })}
                </Box>
              </SubMenu>
            ) : (
              <></>
            )}

            {productReservedOptions?.length > 0 ? (
              <>
                <SubMenu
                  style={subMenuButtonStyle}
                  title={"Frame Width"}
                  label={"Frame Width"}
                  icon={<RxWidth size='1.2rem' />}
                >
                  <Box
                    overflowY='auto'
                    backgroundColor={"#121212"}
                    height='100px'
                  >
                    {defaultWidths.map((width, index) => {
                      return (
                        <MenuItem
                          active={width === frameWidth ? true : false}
                          onClick={(e) => {
                            setWidthView(true);
                            setFrameWidth(Number(width));
                          }}
                          key={index}
                          style={subMenuInnerButtonStyle}
                        >
                          {`inches ${width}`}
                        </MenuItem>
                      );
                    })}
                  </Box>
                </SubMenu>
                {productReservedOptions?.map((option, index) => {
                  return (
                    <SubMenu
                      key={index}
                      style={subMenuButtonStyle}
                      title={option.name}
                      label={
                        option.name === "Size" && size
                          ? `${option.name} (${size})`
                          : option.name === "Frame" && frame
                          ? `${option.name} (${frame})`
                          : option.name === "Matting" && matting
                          ? `${option.name} (${matting})`
                          : option.name
                      }
                      icon={
                        option.name == "Size" ? (
                          <RxDimensions size='1.2rem' />
                        ) : option.name == "Matting" ? (
                          <IoColorPaletteSharp size='1.2rem' />
                        ) : (
                          <SlFrame size='1.2rem' />
                        )
                      }
                    >
                      <Box
                        overflowY='auto'
                        backgroundColor={"#121212"}
                        height='100px'
                      >
                        {option.reservedFields.map((field, index) => {
                          return (
                            <MenuItem
                              active={
                                field.value === size
                                  ? true
                                  : field.value === matting
                                  ? true
                                  : field.value === frame
                                  ? true
                                  : false
                              }
                              onClick={() =>
                                handleReservedOptionsClick(option, field)
                              }
                              key={index}
                              style={subMenuInnerButtonStyle}
                            >
                              {field.value}
                            </MenuItem>
                          );
                        })}
                      </Box>
                    </SubMenu>
                  );
                })}
              </>
            ) : (
              <></>
            )}

            <MenuItem
              icon={<AiOutlineAppstoreAdd size='1.6em' />}
              style={regOptionsMenuItemStyles}
              rootStyles={regOptionsMenuItemRootStyles}
            >
              Regular Options
            </MenuItem>
            <Divider borderColor={"darkGray"} />

            {productRegularOptions?.length > 0 ? (
              <>
                {productRegularOptions?.map((option, index) => {
                  return (
                    <SubMenu
                      key={index}
                      style={subMenuButtonStyle}
                      title={option.name}
                      label={option.name}
                      icon={<IoOptionsSharp size='1.2rem' />}
                    >
                      <Box overflowY='auto' height='100px'>
                        {option.regularFields.map((field, index) => {
                          return (
                            <MenuItem
                              active={false}
                              onClick={() =>
                                handleRegularOptionsClick(option, field)
                              }
                              key={index}
                              style={subMenuInnerButtonStyle}
                            >
                              {field.value}
                            </MenuItem>
                          );
                        })}
                      </Box>
                    </SubMenu>
                  );
                })}
              </>
            ) : (
              <></>
            )}
          </Flex>
        </Menu>
      </Sidebar>
    </Flex>
  );
};
