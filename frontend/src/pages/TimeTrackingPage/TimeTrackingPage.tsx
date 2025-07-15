import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { format, isSameDay, subDays, startOfWeek, endOfWeek, parseISO, addMinutes, differenceInMilliseconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaClock, FaPlay, FaStop, FaCalendarDay, FaArrowRight, FaTimes, FaSignOutAlt } from 'react-icons/fa'; 

interface TimeEntry {
  id: string;
  userId: string;
  timestamp: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
}

interface DailySummary {
  date: string;
  totalHours: number;
  startTime?: string;
  endTime?: string;
}

interface TimeTrackingPageProps {
  userId: string;
  onLogout: () => void;
}

const API_BASE_URL = 'http://localhost:3000/api';

const TimeTrackingPage: React.FC<TimeTrackingPageProps> = ({ userId, onLogout }) => {
  const [currentDayInitialTotalHours, setCurrentDayInitialTotalHours] = useState<number>(0);
  const [liveTotalHours, setLiveTotalHours] = useState<number>(0);
  const [currentDayClockInTime, setCurrentDayClockInTime] = useState<Date | null>(null);
  const [currentDayClockOutTime, setCurrentDayClockOutTime] = useState<Date | null>(null);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [pastSummaries, setPastSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState<Date>(new Date());
  const [showAllSummariesModal, setShowAllSummariesModal] = useState(false);

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  };

  const calculateHoursFromEntries = useCallback((entries: TimeEntry[], forDate: Date): number => {
    let totalMs = 0;
    let clockInTime: Date | null = null;
    const entriesForDate = entries
      .filter(entry => isSameDay(parseISO(entry.timestamp), forDate))
      .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

    for (const entry of entriesForDate) {
      const entryTime = parseISO(entry.timestamp);
      if (entry.type === 'CLOCK_IN') {
        clockInTime = entryTime;
      } else if (entry.type === 'CLOCK_OUT' && clockInTime) {
        totalMs += differenceInMilliseconds(entryTime, clockInTime);
        clockInTime = null;
      }
    }
    if (clockInTime && isSameDay(forDate, new Date())) {
      totalMs += differenceInMilliseconds(new Date(), clockInTime);
    }
    return totalMs / (1000 * 60 * 60);
  }, []);

  const fetchTimeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusResponse = await axios.get(`${API_BASE_URL}/time/status/${userId}`);

      const entries: TimeEntry[] = statusResponse.data.entriesToday as unknown as TimeEntry[]; 

      const todaysEntries = entries.filter(entry =>
        isSameDay(parseISO(entry.timestamp), currentDate)
      ).sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()); 

      let clockedIn = false;
      let lastClockIn: Date | null = null;
      let lastClockOut: Date | null = null;

      for (const entry of todaysEntries) {
        const entryTime = parseISO(entry.timestamp);
        if (entry.type === 'CLOCK_IN') {
          lastClockIn = entryTime;
          clockedIn = true;
        } else if (entry.type === 'CLOCK_OUT') {
          lastClockOut = entryTime;
          clockedIn = false;
        }
      }

      setCurrentDayClockInTime(lastClockIn);
      setCurrentDayClockOutTime(lastClockOut);
      setIsClockedIn(clockedIn);
      const calculatedInitialHours = calculateHoursFromEntries(todaysEntries, currentDate);
      setCurrentDayInitialTotalHours(calculatedInitialHours);
      setLiveTotalHours(calculatedInitialHours); 

      const summaryResponse = await axios.get(`${API_BASE_URL}/time/summary/${userId}?daysBack=30`);
      const filteredSummaries: DailySummary[] = summaryResponse.data.filter(
        (summary: DailySummary) => summary.totalHours > 0
      );

      setPastSummaries(filteredSummaries);

    } catch (err: any) {
      console.error("Erro ao carregar dados do ponto:", err);
      setError("Não foi possível carregar os dados. Tente novamente.");
      setIsClockedIn(false);
      setCurrentDayClockInTime(null);
      setCurrentDayClockOutTime(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeData();

    let interval: number;
    if (isClockedIn) {
      interval = setInterval(fetchTimeData, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, isClockedIn]); 

  const handleClockAction = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setError(null);
    try {
      setLoading(true); 
      await axios.post(`${API_BASE_URL}/time/${type === 'CLOCK_IN' ? 'clock-in' : 'clock-out'}`, { userId });
      await fetchTimeData(); 
    } catch (err: any) {
      console.error(`Erro ao ${type === 'CLOCK_IN' ? 'registrar entrada' : 'registrar saída'}:`, err.response?.data || err.message);
      setError(err.response?.data?.message || `Erro ao ${type === 'CLOCK_IN' ? 'registrar entrada' : 'registrar saída'}.`);
    } finally {
      setLoading(false);
    }
  };

    const currentWeek = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const daysOfWeek = Array.from({ length: 7 }).map((_, i) =>
      addMinutes(startOfCurrentWeek, i * 24 * 60)
    );

    const weekData = daysOfWeek.map(day => {
      const summaryForDay = pastSummaries.find(s => isSameDay(parseISO(s.date), day));

      let dayTotalHours = 0;
      let dayStartTime: string | undefined;
      let dayEndTime: string | undefined;
      let dayStatus: 'Weekend' | 'Complete' | 'In Progress' | 'No Data' = 'No Data';

      if(isSameDay(day, currentDate)) {
        if (currentDayInitialTotalHours > 0 || isClockedIn) {
          dayTotalHours = liveTotalHours;
          dayStartTime = currentDayClockInTime ? format(currentDayClockInTime, 'HH:mm') : undefined;
          dayEndTime = currentDayClockOutTime
            ? format(currentDayClockOutTime, 'HH:mm')
            : (isClockedIn ? 'Em Progresso' : undefined);
          dayStatus = isClockedIn ? 'In Progress' : 'Complete';
        }
        else if (summaryForDay) {
          dayTotalHours = summaryForDay.totalHours;
          dayStartTime = summaryForDay.startTime;
          dayEndTime = summaryForDay.endTime;
          dayStatus = 'Complete';
        }
        else {
          dayTotalHours = 0;
          dayStatus = 'No Data';
        }
      }
      else if (summaryForDay) {
        dayTotalHours = summaryForDay.totalHours;
        dayStartTime = summaryForDay.startTime;
        dayEndTime = summaryForDay.endTime;
        dayStatus = 'Complete';
      }
      else if (day.getDay() === 0 || day.getDay() === 6) {
        dayTotalHours = 0;
        dayStatus = 'Weekend';
      }
      else {
        dayTotalHours = 0;
        dayStatus = 'No Data';
      }

      return {
        dayName: format(day, 'EEEEEE', { locale: ptBR }).toUpperCase(),
        totalHours: dayTotalHours,
        startTime: dayStartTime,
        endTime: dayEndTime,
        status: dayStatus,
      };
    });

    const totalWeekHours = weekData.reduce((sum, day) => sum + day.totalHours, 0);

    return {
      days: weekData,
      total: totalWeekHours,
    };
  }, [currentDate, pastSummaries, liveTotalHours, currentDayClockInTime, currentDayClockOutTime, isClockedIn, currentDayInitialTotalHours]);



  const weekRange = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${format(start, 'MMM dd', { locale: ptBR })} - ${format(end, 'MMM dd, yyyy', { locale: ptBR })}`;
  }, [currentDate]);

  const getTodayFormattedDate = () => {
    return format(currentDate, "EEEE', 'MMMM d, yyyy", { locale: ptBR });
  };

  const isClockInButtonDisabled = isClockedIn || (currentDayClockOutTime !== null) || loading;
  const isClockOutButtonDisabled = !isClockedIn || loading;

  return (

    <main id="main-content" className="bg-neutral-50 w-full h-screen text-neutral-900">
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8 p-4">
          <div className="text-lg text-neutral-800 font-semibold">
            {`#${userId.toLocaleUpperCase()}`}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-300 transition-colors text-sm"
          >
            <FaSignOutAlt />
            Sair
          </button>
        </header>


        <section id="today-tracking" className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl text-neutral-900 mb-2">Relógio de Ponto</h2>
            <p className="text-neutral-600">Controle suas horas de trabalho de hoje ({getTodayFormattedDate()})</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

            <div className="text-center">
              <div className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">
                <FaPlay className="text-3xl text-neutral-600 mb-4 mx-auto" />
                <h3 className="text-lg text-neutral-900 mb-2">Horário de Entrada</h3>
                <div className={`text-2xl mb-4 ${currentDayClockInTime ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  <p>
                    {currentDayClockInTime ? format(currentDayClockInTime, 'HH:mm') : '-- : --'}
                  </p> 
                </div>
                  <button
                      className={`flex items-center justify-center gap-2 w-full px-6 py-2 rounded-md transition-colors
                        ${isClockInButtonDisabled
                          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                          : 'bg-neutral-600 text-white hover:bg-neutral-700'
                        }`}
                    onClick={() => handleClockAction("CLOCK_IN")}
                    disabled={isClockInButtonDisabled}  
                  >
                    <FaClock />
                    <span>Bater o ponto</span>
                  </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-neutral-50 border-2 border-neutral-200 rounded-lg p-6">
                <FaStop className="text-3xl text-neutral-600 mb-4 mx-auto" />
                <h3 className="text-lg text-neutral-900 mb-2">Horário de Saída</h3>
                <div className={`text-2xl mb-4 ${currentDayClockOutTime ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  <p>
                    {currentDayClockOutTime ? format(currentDayClockOutTime, 'HH:mm') : '-- : --'}
                  </p>
                </div>
                  <button
                      className={`flex items-center justify-center gap-2 w-full px-6 py-2 rounded-md transition-colors
                      ${isClockOutButtonDisabled
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-600 text-white hover:bg-neutral-700'
                      }`}
                    onClick={() => handleClockAction("CLOCK_OUT")}
                    disabled={isClockOutButtonDisabled}
                  >
                    <FaClock />
                    <span> Bater o ponto</span>
                  </button>
              </div>
            </div>
          </div>  
        </section>

        <section id="week-summary" className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-neutral-900">Resumo da Semana</h2>
            <span className="text-sm text-neutral-500">{weekRange}</span>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {currentWeek.days.map((day, index) => (
              <div key={index} className="text-center">
                <div className={`text-xs mb-2 ${isSameDay(currentDate, subDays(startOfWeek(currentDate, { weekStartsOn: 1 }), -index)) ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                  {day.dayName}
                </div>
                <div className={`rounded-lg p-3 ${day.status === 'Weekend' || day.totalHours === 0 ? 'bg-neutral-50' : 'bg-neutral-100'} ${isSameDay(currentDate, subDays(startOfWeek(currentDate, { weekStartsOn: 1 }), -index)) ? 'border-2 border-neutral-400' : ''}`}>
                  <div className={`text-sm ${day.status === 'Weekend' || day.totalHours === 0 ? 'text-neutral-400' : 'text-neutral-900'}`}>
                    {day.totalHours > 0 ? formatHours(day.totalHours) : '--'}
                  </div>
                  <div className={`text-xs mt-1 ${day.status === 'Weekend' || day.totalHours === 0 ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {day.status === 'Weekend' ? 'Final de Semana' : (day.startTime && day.endTime ? `${day.startTime}-${day.endTime}` : (day.status === 'In Progress' ? 'Em Progresso' : '00:00-00:00'))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total de horas na semana:</span>
              <span className="text-xl text-neutral-900">{formatHours(currentWeek.total)}</span>
            </div>
          </div>
        </section>

        <section id="recent-history" className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-neutral-900">Histórico Recente</h2>
            {pastSummaries.length > 3 && (
              <button
                className="text-neutral-600 hover:text-neutral-800 text-sm flex items-center"
                onClick={() => setShowAllSummariesModal(true)}
              >
                Ver Tudo <FaArrowRight className="ml-1" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {pastSummaries
                .slice(0, 3)
                .map((summary) => (
              <div key={summary.date} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                    <FaCalendarDay className="text-neutral-600" />
                  </div>
                  <div>
                    <div className="text-neutral-900">{format(parseISO(summary.date), "EEEE', 'MMM d", { locale: ptBR })}</div>
                    <div className="text-sm text-neutral-600">
                      {summary.startTime && summary.endTime ? `${summary.startTime} - ${summary.endTime}` : 'Horários não disponíveis'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-900">{formatHours(summary.totalHours)}</div>
                  <div className="text-sm text-neutral-600">Completo</div>
                </div>
              </div>
            ))}

            {pastSummaries.filter(s => s.totalHours > 0).length === 0 && !loading && (
              <p className="text-center text-neutral-600">Nenhum registro no histórico recente com horas.</p>
            )}
          </div>
        </section>
      </div>

      {showAllSummariesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl text-neutral-900 mb-6 flex justify-between items-center">
              Histórico de Horas
              <button
                onClick={() => setShowAllSummariesModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <FaTimes size={20} /> 
              </button>
            </h2>

            <div className="space-y-4">
              {pastSummaries
                .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()) 
                .map((summary) => (
                <div key={summary.date} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                      <FaCalendarDay className="text-neutral-600" />
                    </div>
                    <div>
                      <div className="text-neutral-900">{format(parseISO(summary.date), "EEEE', 'MMM d", { locale: ptBR })}</div>
                      <div className="text-sm text-neutral-600">
                        {summary.startTime && summary.endTime ? `${summary.startTime} - ${summary.endTime}` : 'Horários não disponíveis'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-900">{formatHours(summary.totalHours)}</div>
                    <div className="text-sm text-neutral-600">Completo</div>
                  </div>
                </div>
              ))}
              {pastSummaries.filter(s => s.totalHours > 0).length === 0 && (
                <p className="text-center text-neutral-600">Nenhum registro com horas no histórico.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TimeTrackingPage;