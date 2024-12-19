import { Link, useNavigate } from 'react-router-dom';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import {createNewEvent} from '../../util/api.js'
import ErrorBlock from '../UI/ErrorBlock.jsx'
import {queryClient} from '../../util/api.js';

export default function NewEvent() {
  const navigate = useNavigate();
  const {
    isPending, mutate, isError, error
  } =
  useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      navigate('/events')
      queryClient.invalidateQueries({
        queryKey: ['events']
      })
    }
  })
  function handleSubmit(formData) {
    mutate({event: formData})
  }

  const actionBlock = <>
    <Link to="../" className="button-text">
      Cancel
    </Link>
    <button type="submit" className="button">
      Create
    </button>
  </>
  return (
    <Modal onClose={() => navigate('../')}>
      {isError && <ErrorBlock title="An error occurred" message={error?.info?.message} />}
      <EventForm onSubmit={handleSubmit}>
        {isPending ? 'Submitting...' : actionBlock}
      </EventForm>
    </Modal>
  );
}
