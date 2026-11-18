import { useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useAction } from "../hooks/useResource";
import { api, downloadDocument } from "../lib/api";
import {
  DOCUMENTS,
  date,
  fileError,
  isEditable,
  latestDocuments,
} from "../lib/domain";
import { useToast } from "../context/ToastContext";
import {
  Badge,
  Button,
  ErrorNotice,
  Modal,
  SelectField,
  TextAreaField,
} from "./UI";
export function UploadDialog({ applicationId, type, onClose, onSuccess }) {
  const action = useAction();
  const [file, setFile] = useState(null),
    [progress, setProgress] = useState(0);
  async function submit(e) {
    e.preventDefault();
    const error = fileError(file);
    if (error) {
      action.setError(error);
      return;
    }
    await action.run(async () => {
      const data = new FormData();
      data.append("documentType", type);
      data.append("file", file);
      await api.post(`/loan-applications/${applicationId}/documents`, data, {
        timeout: 60000,
        onUploadProgress: (event) =>
          setProgress(
            Math.round((event.loaded / (event.total || event.loaded)) * 100),
          ),
      });
      onSuccess();
    });
  }
  return (
    <Modal
      title={`Upload ${DOCUMENTS[type].toLowerCase()}`}
      description="Choose a fictional PDF, JPG or PNG document, up to 5 MB."
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <label className="upload-dropzone">
          <UploadCloud size={32} />
          <strong>{file ? file.name : "Choose your document"}</strong>
          <span>
            {file
              ? `${(file.size / 1024).toFixed(1)} KB`
              : "PDF, JPG or PNG · maximum 5 MB"}
          </span>
          <input
            type="file"
            aria-label="Choose document"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              action.setError(null);
              setProgress(0);
            }}
            disabled={action.busy}
          />
        </label>
        {action.busy && (
          <div className="upload-progress" role="status">
            <div>
              <i style={{ width: `${progress}%` }} />
            </div>
            <span>
              {progress === 100 ? "Saving document…" : `Uploading ${progress}%`}
            </span>
          </div>
        )}
        <p className="muted small">
          Uploading a replacement makes it the latest file for this category. It
          will need a new verification.
        </p>
        <div className="modal-actions">
          <Button
            variant="outline"
            type="button"
            disabled={action.busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" busy={action.busy} disabled={!file}>
            Upload document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function VerifyDialog({ document, onClose, onSuccess }) {
  const action = useAction();
  const [status, setStatus] = useState("VERIFIED"),
    [remarks, setRemarks] = useState("");
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      await api.put(`/documents/${document.id}/verify`, {
        status,
        remarks: remarks.trim(),
      });
      onSuccess();
    });
  }
  return (
    <Modal
      title="Review document"
      description={document.originalFilename}
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <SelectField
          label="Verification decision"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "VERIFIED", label: "Verified" },
            { value: "REJECTED", label: "Rejected — needs a replacement" },
          ]}
        />
        <TextAreaField
          label="Verification remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
          maxLength={1000}
          placeholder="Explain your verification decision…"
        />
        <div className="modal-actions">
          <Button
            variant="outline"
            type="button"
            disabled={action.busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" busy={action.busy}>
            Save verification
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export default function DocumentPanel({
  application,
  documents,
  role,
  onRefresh,
}) {
  const [dialog, setDialog] = useState(null);
  const notify = useToast();
  const action = useAction();
  const latest = latestDocuments(documents);
  const editable = isEditable(application.status);
  const verified = Object.values(latest).filter(
    (d) => d.verificationStatus === "VERIFIED",
  ).length;
  const done = (message) => {
    setDialog(null);
    notify(message);
    onRefresh();
  };
  const download = (d) => action.run(() => downloadDocument(d));
  return (
    <>
      <div className="document-intro">
        <div>
          <h2>Your document checklist</h2>
          <p>All five categories must be verified before approval.</p>
        </div>
        <span className="checklist-count">
          <CheckCircle2 size={17} />
          {verified} of 5 verified
        </span>
      </div>
      <ErrorNotice error={action.error} />
      <div className="document-grid">
        {Object.entries(DOCUMENTS).map(([type, label]) => {
          const d = latest[type];
          return (
            <article key={type} className="document-card">
              <div className="document-card-title">
                <span className="document-icon">
                  <FileText size={23} />
                </span>
                <div>
                  <h3>{label}</h3>
                  {d ? (
                    <Badge status={d.verificationStatus} />
                  ) : (
                    <span className="missing-document">Not uploaded</span>
                  )}
                </div>
              </div>
              {d ? (
                <>
                  <p className="document-filename" title={d.originalFilename}>
                    {d.originalFilename}
                  </p>
                  <small className="muted">
                    {date(d.uploadedAt)} · {(d.sizeBytes / 1024).toFixed(1)} KB
                  </small>
                  {d.verificationRemarks && (
                    <div className="document-remark">
                      {d.verificationRemarks}
                    </div>
                  )}
                </>
              ) : (
                <p className="document-prompt">
                  Add your {label.toLowerCase()} to complete this part of the
                  checklist.
                </p>
              )}
              <div className="document-actions">
                {d && (
                  <Button
                    variant="outline"
                    disabled={action.busy}
                    onClick={() => download(d)}
                  >
                    <Download size={15} /> Download
                  </Button>
                )}
                {role === "CUSTOMER" && editable && (
                  <Button
                    variant={d ? "soft" : "primary"}
                    onClick={() => setDialog({ kind: "upload", type })}
                  >
                    <UploadCloud size={15} />
                    {d ? "Replace" : "Upload"}
                  </Button>
                )}
                {role !== "CUSTOMER" && editable && d && (
                  <Button
                    variant="primary"
                    onClick={() => setDialog({ kind: "verify", document: d })}
                  >
                    <FileCheck2 size={15} /> Review
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!editable && (
        <div className="info-notice mt-3">
          Document changes are closed for this application because a decision
          has been recorded.
        </div>
      )}
      {documents.length > Object.keys(latest).length && (
        <details className="previous-uploads">
          <summary>
            Previous uploads ({documents.length - Object.keys(latest).length})
          </summary>
          <div className="table-responsive">
            <table className="table app-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter((d) => latest[d.documentType]?.id !== d.id)
                  .map((d) => (
                    <tr key={d.id}>
                      <td>{d.originalFilename}</td>
                      <td>{DOCUMENTS[d.documentType]}</td>
                      <td>{date(d.uploadedAt, true)}</td>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => download(d)}
                          disabled={action.busy}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {dialog?.kind === "upload" && (
        <UploadDialog
          applicationId={application.id}
          type={dialog.type}
          onClose={() => setDialog(null)}
          onSuccess={() =>
            done("Document uploaded. Your officer can now review it.")
          }
        />
      )}
      {dialog?.kind === "verify" && (
        <VerifyDialog
          document={dialog.document}
          onClose={() => setDialog(null)}
          onSuccess={() => done("Document verification saved.")}
        />
      )}
    </>
  );
}
