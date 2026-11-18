import { useEffect, useState } from "react";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAction, useResource } from "../hooks/useResource";
import { api } from "../lib/api";
import { initials, profileBody } from "../lib/domain";
import { ProfileFields, emptyProfile } from "./AuthPages";
import {
  Button,
  DemoNote,
  ErrorNotice,
  Loading,
  PageHeader,
} from "../components/UI";
export default function ProfilePage() {
  const { user, updateName } = useAuth();
  const notify = useToast();
  const resource = useResource("/customers/profile");
  const action = useAction();
  const [form, setForm] = useState(emptyProfile);
  useEffect(() => {
    if (resource.data) setForm(resource.data);
  }, [resource.data]);
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      const { data } = await api.put("/customers/profile", profileBody(form));
      resource.setData(data);
      updateName(data.fullName);
      notify("Your profile has been updated.");
    });
  }
  return (
    <>
      <PageHeader
        eyebrow="My account"
        title="A little about you."
        description="Keep your personal and employment details up to date."
      />
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : (
        <div className="profile-layout">
          <aside className="card profile-summary">
            <span className="avatar avatar-large">
              {initials(user.fullName)}
            </span>
            <h2>{user.fullName}</h2>
            <span className="product-tag">Customer account</span>
            <div className="profile-email">
              <Mail size={16} />
              {user.email}
            </div>
            <hr />
            <p>
              <ShieldCheck size={18} /> Your submitted applications keep their
              original financial details.
            </p>
            <small className="muted">
              Profile changes apply to future applications.
            </small>
          </aside>
          <section className="card form-card">
            <h2>Personal & employment details</h2>
            <ErrorNotice error={action.error} />
            <form onSubmit={submit}>
              <ProfileFields form={form} setForm={setForm} />
              <div className="form-footer">
                <span className="muted small">
                  Your email address cannot be changed here.
                </span>
                <Button busy={action.busy} type="submit">
                  Save changes
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
      <div className="mt-4">
        <DemoNote />
      </div>
    </>
  );
}
