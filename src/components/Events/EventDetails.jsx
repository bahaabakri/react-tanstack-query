import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../util/api.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {queryClient} from "../../util/api.js"
import { useState } from "react";
import Modal from "../UI/Modal.jsx"
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate()
  const [isDeletePopupOpened, setIsDeletePopupOpen] = useState(false)
  const {
    data: event,
    isLoading: isLoadingGetEvent,
    error: errorGetEvent,
    isError: isErrorGetEvent,
  } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const { 
    isPending:isLoadingDeleteEvent,
    error: errorDeleteEvent,
    isError: isErrorDeleteEvent,
    mutate: mutateDeleteEvent 
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('/events')
    },
  });

  const onStartDeleteEvent = () => {
    setIsDeletePopupOpen(true)
  }
  const onDeleteEvent = () => {
    mutateDeleteEvent({id})
  }
  const onCancelDeleteEvent = () => {
    setIsDeletePopupOpen(false)
  }
  let formatedDate
  if (event) {
    formatedDate = new Date(event.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
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
      {event && 
        (<article id="event-details">
          <header>
            <h1>{event.title}</h1>
            <nav>
              <button onClick={onStartDeleteEvent}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${event.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{event.location}</p>
                <time dateTime={`${formatedDate} ${event.time}`}>
                  {formatedDate} @ {event.time}
                </time>
              </div>
              <p id="event-details-description">{event.description}</p>
            </div>
          </div>
        </article>
      )}
      {
        isDeletePopupOpened &&
        <Modal onClose={onCancelDeleteEvent}>
          {isErrorDeleteEvent && <ErrorBlock title="An error occurred" message={errorDeleteEvent?.info?.message} />}
          <p>Are you sure want to delete {event.title} permanently ?</p>
          <p className="form-actions">
          {isLoadingDeleteEvent ? 'Submitting...' :
          <>
            <button onClick={onCancelDeleteEvent} className="button-text">
              Cancel
            </button>
            <button onClick={onDeleteEvent} className="button">
              Delete
            </button>
          </>
          }
          </p>


        </Modal>
      }
    </>
  );
}
