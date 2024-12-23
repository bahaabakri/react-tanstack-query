import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/api.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx'

export default function EditEvent() {
  const navigate = useNavigate();
  const {id} = useParams()
  const {
    data: event,
    isLoading: isLoadingGetEvent,
    error: errorGetEvent,
    isError: isErrorGetEvent,
  } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  })

  const {
    mutate: onSubmitUpdate
  } =
  useMutation({
    mutationFn:  updateEvent,
    onMutate: async ({id, event}) => {
      // stop all in going queries regarding to this event id
      await queryClient.cancelQueries({queryKey: ['events', { id }]})
      // get the previous query to use in case of error
      const prevQuery = queryClient.getQueryData(['events', { id }])
      // update the query manually 
      queryClient.setQueryData(['events', { id }], event)
      // close modal
      handleClose()
      // return prevQuery to pass it to context of onError Func
      return prevQuery
    },
    onError:(error, {id}, context) => {
        // rollback to prev Query
        queryClient.setQueryData(['events', { id }], context.prevQuery)
    },
    onSettled:() => {
      // mack sure that FE and BE in the same page
      queryClient.invalidateQueries({
        queryKey: ['events', { id }]
      })
    }
  })

  const handleSubmit = (formData) => {
    onSubmitUpdate({id, event: formData})
  }
  const handleClose = () => {
    navigate('../');
  }
  return (
    <Modal onClose={handleClose}>
      {isLoadingGetEvent && (
        <div id="event-loader-wrapper">
          <LoadingIndicator />
        </div>
      )}
      {isErrorGetEvent && (
        <div id="event-error-wrapper">
          <ErrorBlock
            title="An error occurred"
            message={errorGetEvent?.info?.message}
          />
        </div>
      )}
      {event && (
      <EventForm inputData={event} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>

      )}
    </Modal>
  );
}
