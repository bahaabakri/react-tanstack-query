import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../util/api.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {queryClient} from "../../util/api.js"
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate()
  const {
    data: event,
    isLoading: isLoadingGetEvent,
    error: errorGetEvent,
    isError: isErrorGetEvent,
  } = useQuery({
    queryKey: ["event", { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const { 
    // isLoading:isLoadingDeleteEvent,
    // error: errorDeleteEvent,
    // isError: isErrorDeleteEvent,
    mutate: mutateDeleteEvent 
  } = useMutation({
    mutationFn: () => deleteEvent({id }),
    onSuccess: () => {
      navigate('/events')
      queryClient.invalidateQueries({
        queryKey: ['events']
      })
    },
  });

  const onDeleteEvent = () => {
    if(window.confirm(`Are you sure want to delete ${event.title} event?`)) {
      mutateDeleteEvent()
    }
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
      {event && (
        <article id="event-details">
          <header>
            <h1>{event.title}</h1>
            <nav>
              <button onClick={onDeleteEvent}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${event.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{event.location}</p>
                <time dateTime={`${event.date} ${event.time}`}>
                  {event.date} {event.time}
                </time>
              </div>
              <p id="event-details-description">{event.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
