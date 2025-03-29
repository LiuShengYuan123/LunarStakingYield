'use client'
import React, {useEffect} from "react";
import Modal from "react-modal";
import { RingLoader } from "react-spinners"


interface ModalProps {
  isLoading: boolean;    // 直接控制loading状态
  parentRef: React.RefObject<HTMLDivElement | null>;
}

const _Modal = ({isLoading,parentRef}:ModalProps) => {

  useEffect(() => {
    Modal.setAppElement(document.body);
  }, []);

  return (
    <Modal 
      isOpen={isLoading} 
      parentSelector={() => parentRef.current ? parentRef.current : document.body }
      style={{
        overlay:{
          position:'absolute',
          top: 0,left: 0,right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          inset: 0,
        },
        content:{
          position: 'relative',
          inset: 'auto',
          background: 'transparent',
          border: 'none',
          padding: 0,
          overflow: 'visible',
          display: 'flex',        // Flex 布局
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',         // 确保高度占满
        }
      }}
    >
        <TransactionLoader/>
    </Modal>
  )
};
export default _Modal;

const TransactionLoaderStyles = {
  wrapper: `text-white h-full w-full flex flex-col justify-center items-center`,
  title: `font-semibold text-xl mb-12`,
  detail: `font-semibold mb-12 text-xs my-12 text-gray-400`,
};

const TransactionLoader = () => {
  return (
    <div className={TransactionLoaderStyles.wrapper}>
      <div className={TransactionLoaderStyles.title}>Transaction in progress...</div>
      <RingLoader color={"#fff"} loading={true}  size={50} />
      <div className={TransactionLoaderStyles.detail}>Estimated time: 30 seconds...</div>
    </div>
  );
};


