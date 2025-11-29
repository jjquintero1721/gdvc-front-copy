import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import appointmentService from "@/services/appointmentService";
import {useAuthStore} from "@store/AuthStore.jsx";

import "./WeeklyCalendar.css";

const WeeklyCalendar = ({ onDayClick, refreshTrigger }) => {
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const isVeterinarian = user?.rol === "veterinario";

  useEffect(() => {
    loadAppointments();
  }, [refreshTrigger]);

  const loadAppointments = async () => {
      try {
        const response = await appointmentService.getAllAppointments({
          skip: 0,
          limit: 0,
        });

        const appointments = response.data?.citas || [];

        // Agrupamos por día ↓↓↓
        const grouped = {};

        appointments.forEach((a) => {
          const day = a.fecha_hora.split("T")[0];
          const isVetAppointment = isVeterinarian && a.veterinario?.id === user?.id;

          if (!grouped[day]) {
            grouped[day] = {
              total: 0,
              vet: 0,
            };
          }

          grouped[day].total += 1;
          if (isVetAppointment) grouped[day].vet += 1;
        });

        // Crear 1 evento visual por día
        const mapped = Object.keys(grouped).map((day) => {
          const hasVet = grouped[day].vet > 0;

          return {
            id: day,
            title: "",
            start: day,
            allDay: true,
            extendedProps: {
              total: grouped[day].total,
              vet: grouped[day].vet,
              isVetDay: hasVet,
            },
          };
        });

        console.log("EVENTOS AGRUPADOS:", mapped);
        setEvents(mapped);
      } catch (e) {
        console.error("Error cargando citas:", e);
      }
    };


  const handleDateClick = (info) => {
    if (onDayClick) onDayClick(info.date);
  };

  const renderEventDot = (arg) => {
      const { total, vet, isVetDay } = arg.event.extendedProps;
      const color = isVetDay ? "#10b981" : "#6D28D9";

      return (
        <div
          className="pawflow-pill"
          style={{ "--pill-color": color }}
        >
        </div>
      );
    };



  return (
    <div className="pawflow-calendar">

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        firstDay={1}
        headerToolbar={{
          left: "prev customToday next",
          center: "title",
          right: "",
        }}
        customButtons={{
          customToday: {
            text: "Hoy",
            click() {
              calendarRef.current.getApi().today();
            },
          },
        }}
        events={events}
        eventContent={renderEventDot}
        eventDisplay="list-item"
        dateClick={handleDateClick}
        height="auto"
      />
    </div>
  );
};

export default WeeklyCalendar;
