import React from "react";

const DeleteConfirmModal = ({
  title,
  message,
  subMessage,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header confirm">{title}</div>
        <div className="modal-body">
          <div className="confirm-text">{message}</div>
          <div className="confirm-subtext">{subMessage}</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onConfirm}>
            {title.includes("Delete") ? "Delete Playlist" : "Remove Song"}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
