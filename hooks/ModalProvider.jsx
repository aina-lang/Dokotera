import React, { createContext, useContext, useRef, useState } from "react";

import { StyleSheet, Modal, View } from "react-native";
import { COLORS, SIZES } from "@/constants";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const modalRef = useRef(null); // Create a ref for the Modal component
  const [isVisible, setIsVisible] = useState(false); // State for modal visibility
  const [content, setContent] = useState(null); // State for modal content

  const openModal = (component) => {
    setContent(component);
    setIsVisible(true); // Set modal to visible
  };

  const closeModal = () => {
    setIsVisible(false); // Set modal to hidden
    setContent(null); // Clear content on close
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal
        visible={isVisible}
        ref={modalRef}
        animationType="slide" // Optional: Set animation type (slide, fade, etc.)
        transparent={true} // Allow background interaction
        hardwareAccelerated={true} // Improve performance on some devices
        onRequestClose={closeModal} // Handle close button or outside tap
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            height: SIZES.height,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {content}
        </View>
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
