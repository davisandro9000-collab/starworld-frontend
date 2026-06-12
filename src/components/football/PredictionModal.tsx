import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { getActivePredictionGames, submitPredictionEntry } from '../../api/football';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
  matchId: string;
}

export default function PredictionModal({ open, onClose, matchId }: Props) {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const [predictedTeamId, setPredictedTeamId] = useState('');
  const [predictedPlayerId, setPredictedPlayerId] = useState('');
  const [predictedStage, setPredictedStage] = useState('');
  const [predictedValue, setPredictedValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: games, isLoading } = useQuery({
    queryKey: ['prediction-games', matchId],
    queryFn: getActivePredictionGames,
    enabled: open,
  });

  // Find the game for this match (assuming only one active game per match)
  const game = games?.find(g => g.matchId === matchId);
  const predictionType = game?.predictionType;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!game) throw new Error('No prediction game found');
      let payload: any = {};
      if (predictionType === 'WINNER') payload.predictedTeamId = predictedTeamId;
      else if (predictionType === 'FIRST_SCORER' || predictionType === 'ASSIST') payload.predictedPlayerId = predictedPlayerId;
      else if (predictionType === 'NEXT_STAGE') payload.predictedStage = predictedStage;
      else payload.predictedValue = predictedValue;
      await submitPredictionEntry(game.id, payload, crypto.randomUUID());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prediction-entries'] });
      onClose();
    },
    onError: (error) => {
      console.error('Prediction submission failed:', error);
      alert('Failed to submit prediction. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game) return;
    setSubmitting(true);
    await mutation.mutateAsync();
    setSubmitting(false);
  };

  if (!user) return <Modal open={open} onClose={onClose} title="Login Required"><p>Please login to predict.</p></Modal>;
  if (isLoading) return <Modal open={open} onClose={onClose} title="Loading..."><Spinner /></Modal>;
  if (!game) return <Modal open={open} onClose={onClose} title="No Predictions">No active prediction games for this match.</Modal>;

  return (
    <Modal open={open} onClose={onClose} title={`Predict: ${game.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {predictionType === 'WINNER' && (
          <div>
            <label className="block text-white/70 text-sm mb-1">Select Winner</label>
            <select
              className="input-sw w-full"
              value={predictedTeamId}
              onChange={e => setPredictedTeamId(e.target.value)}
              required
            >
              <option value="">-- Choose team --</option>
              {game.match && (
                <>
                  <option value={game.match.homeTeam.id}>{game.match.homeTeam.name}</option>
                  <option value={game.match.awayTeam.id}>{game.match.awayTeam.name}</option>
                </>
              )}
            </select>
          </div>
        )}
        {predictionType === 'FIRST_SCORER' && (
          <div>
            <label className="block text-white/70 text-sm mb-1">First Goal Scorer</label>
            <input
              type="text"
              className="input-sw w-full"
              placeholder="Player name"
              value={predictedValue}
              onChange={e => setPredictedValue(e.target.value)}
              required
            />
          </div>
        )}
        {predictionType === 'NEXT_STAGE' && (
          <div>
            <label className="block text-white/70 text-sm mb-1">Stage to reach</label>
            <select className="input-sw w-full" value={predictedStage} onChange={e => setPredictedStage(e.target.value)} required>
              <option value="">Select</option>
              <option value="Quarter-finals">Quarter-finals</option>
              <option value="Semi-finals">Semi-finals</option>
              <option value="Final">Final</option>
            </select>
          </div>
        )}
        <div className="bg-gold/10 p-3 rounded-lg">
          <p className="text-white/80 text-sm">Reward: {game.points} points + {game.coinReward} coins</p>
        </div>
        <button type="submit" className="btn-gold w-full" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Prediction'}
        </button>
      </form>
    </Modal>
  );
}