import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInvitationByToken, acceptInvitation } from '../lib/dataService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import './InvitePage.css';

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  async function loadInvitation() {
    try {
      const inv = await getInvitationByToken(token);
      setInvitation(inv);
    } catch (err) {
      setError('Convite não encontrado ou expirado.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!user) return;
    try {
      await acceptInvitation(invitation.id, user.id);
      setAccepted(true);
    } catch (err) {
      setError('Erro ao aceitar o convite. Tente novamente.');
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="invite-page">
        <Card className="invite-card" variant="warm">
          <p>Carregando...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-page">
        <Card className="invite-card" variant="warm">
          <div className="invite-icon">😕</div>
          <h2>Convite inválido</h2>
          <p className="invite-text">{error}</p>
          <Button variant="primary" size="md" onClick={() => navigate('/login')}>
            Ir para o login
          </Button>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="invite-page">
        <Card className="invite-card invite-success" variant="warm">
          <div className="invite-icon">🎉</div>
          <h2>Convite aceito!</h2>
          <p className="invite-text">
            Você agora faz parte da rede de <strong>{invitation.inviter?.name || 'seu amigo'}</strong> e está confirmado para o café!
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/home')}>
            Ver meus cafés
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <Card className="invite-card" variant="warm">
        <div className="invite-icon">☕</div>
        <h2>Você foi convidado!</h2>
        <p className="invite-inviter">
          <strong>{invitation.inviter?.name || 'Um amigo'}</strong> te convidou para um café
        </p>

        <div className="invite-meetup-info">
          <h3>{invitation.meetup?.name}</h3>
          <p className="invite-date">{formatDate(invitation.meetup?.date)} às {invitation.meetup?.time?.slice(0, 5)}</p>
          <p className="invite-address">📍 {invitation.meetup?.address}</p>
          {invitation.meetup?.notes && (
            <p className="invite-notes">💬 {invitation.meetup.notes}</p>
          )}
        </div>

        {user ? (
          <div className="invite-actions">
            <p className="invite-logged-as">Logado como <strong>{user.email}</strong></p>
            <Button variant="primary" size="lg" fullWidth onClick={handleAccept}>
              Aceitar convite
            </Button>
            <p className="invite-disclaimer">
              Ao aceitar, você será conectado à rede e confirmado neste café.
            </p>
          </div>
        ) : (
          <div className="invite-actions">
            <p className="invite-login-prompt">
              Faça login ou crie uma conta para aceitar o convite.
            </p>
            <Link to={`/login?invite=${token}`} className="invite-btn-link">
              <Button variant="primary" size="lg" fullWidth>
                Entrar
              </Button>
            </Link>
            <Link to={`/register?invite=${token}`} className="invite-btn-link">
              <Button variant="secondary" size="lg" fullWidth>
                Criar conta
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
