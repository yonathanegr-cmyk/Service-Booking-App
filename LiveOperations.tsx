import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Map, Overlay } from 'pigeon-maps';
import { 
  ArrowRight,
  MapPin, 
  Clock, 
  User, 
  Navigation2, 
  Shield, 
  Home,
  RefreshCw,
  ChevronLeft,
  Phone,
  FileText,
  AlertCircle,
  Activity,
  Loader2,
  Search,
  Filter,
  TrendingUp,
  XCircle,
  UserX
} from 'lucide-react';
import { useOrderStore } from '../../stores/OrderStore';
import { 
  Job, 
  JobLog, 
  JobStatus,
  JOB_STATUS_LABELS, 
  JOB_STATUS_COLORS,
  isLiveTrackingStatus,
  JobLogAction
} from '../../types/job';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const mapboxProvider = (x: number, y: number, z: number, dpr?: number) => {
  const retina = dpr && dpr >= 2 ? '@2x' : '';
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/${z}/${x}/${y}${retina}?access_token=${MAPBOX_TOKEN}`;
};

const JOB_LOG_ACTION_LABELS: Record<JobLogAction, string> = {
  job_created: 'עבודה נוצרה',
  status_changed: 'סטטוס השתנה',
  provider_assigned: 'בעל מקצוע הוקצה',
  provider_location_updated: 'מיקום עודכן',
  price_updated: 'מחיר עודכן',
  security_code_verified: 'קוד אבטחה אומת',
  payment_initiated: 'תשלום הופעל',
  payment_completed: 'תשלום הושלם',
  payment_failed: 'תשלום נכשל',
  job_cancelled: 'עבודה בוטלה',
  admin_action: 'פעולת מנהל',
  system_event: 'אירוע מערכת'
};

interface LiveOperationsProps {
  onBack?: () => void;
}

export function LiveOperations({ onBack }: LiveOperationsProps) {
  const { orders, getAdminOrders, cancelOrder, updateOrderStatus, isLoading, subscribe } = useOrderStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoom, setZoom] = useState(14);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const allOrders = useMemo(() => getAdminOrders(), [orders]);
  
  const activeStatuses: JobStatus[] = [
    'searching', 'pending_acceptance', 'accepted',
    'en_route', 'arrived', 'in_progress', 'payment_pending'
  ];
  
  const jobs = useMemo(() => 
    allOrders.filter(order => activeStatuses.includes(order.status)),
    [allOrders]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      searching: 0,
      pending_acceptance: 0,
      accepted: 0,
      en_route: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total: allOrders.length
    };
    allOrders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    return counts;
  }, [allOrders]);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLastRefresh(new Date());
      if (selectedJob) {
        const updatedJob = allOrders.find(j => j.id === selectedJob.id);
        if (updatedJob) {
          setSelectedJob(updatedJob);
        }
      }
    });
    return unsubscribe;
  }, [subscribe, selectedJob, allOrders]);

  const generateMockLogs = useCallback((job: Job): JobLog[] => {
    const logs: JobLog[] = [];
    const addLog = (action: JobLogAction, timestamp: string, metadata?: Record<string, unknown>) => {
      logs.push({
        id: `log_${logs.length}`,
        jobId: job.id,
        action,
        actor: 'system',
        timestamp,
        metadata
      });
    };
    
    addLog('job_created', job.createdAt, { category: job.serviceData.category });
    
    if (job.status !== 'searching') {
      addLog('status_changed', job.updatedAt, { 
        previousStatus: 'searching',
        newStatus: job.status 
      });
    }
    
    if (job.providerId && job.provider) {
      addLog('provider_assigned', job.acceptedAt || job.updatedAt, {
        providerId: job.providerId,
        providerName: job.provider.name
      });
    }
    
    return logs;
  }, []);

  useEffect(() => {
    if (selectedJob) {
      setLogsLoading(true);
      const logs = generateMockLogs(selectedJob);
      setJobLogs(logs);
      setLogsLoading(false);
      detailRef.current?.focus();
    }
  }, [selectedJob, generateMockLogs]);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseDetail = () => {
    setSelectedJob(null);
    setJobLogs([]);
    listRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, job: Job) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectJob(job);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.userLocation.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getElapsedTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: false, locale: he });
    } catch {
      return 'לא ידוע';
    }
  };

  const getStatusColorClass = (status: string) => {
    const colorClass = JOB_STATUS_COLORS[status as keyof typeof JOB_STATUS_COLORS] || 'bg-gray-500';
    return colorClass;
  };

  const breadcrumbCoords: [number, number][] = selectedJob?.providerBreadcrumbs?.map(
    b => [b.lat, b.lng] as [number, number]
  ) || [];

  const getMapCenter = (): [number, number] => {
    if (!selectedJob) return [32.0853, 34.7818];
    
    const clientLat = selectedJob.userLocation.lat;
    const clientLng = selectedJob.userLocation.lng;
    
    if (selectedJob.provider?.currentLocation) {
      const providerLat = selectedJob.provider.currentLocation.lat;
      const providerLng = selectedJob.provider.currentLocation.lng;
      return [(clientLat + providerLat) / 2, (clientLng + providerLng) / 2];
    }
    
    if (breadcrumbCoords.length > 0) {
      const lastCrumb = breadcrumbCoords[breadcrumbCoords.length - 1];
      return [(clientLat + lastCrumb[0]) / 2, (clientLng + lastCrumb[1]) / 2];
    }
    
    return [clientLat, clientLng];
  };

  const getProviderPosition = (): [number, number] | null => {
    if (!selectedJob) return null;
    
    if (selectedJob.provider?.currentLocation) {
      return [selectedJob.provider.currentLocation.lat, selectedJob.provider.currentLocation.lng];
    }
    
    if (breadcrumbCoords.length > 0) {
      return breadcrumbCoords[breadcrumbCoords.length - 1];
    }
    
    return null;
  };

  const uniqueStatuses = Array.from(new Set(jobs.map(j => j.status)));

  return (
    <div 
      className="min-h-screen bg-gray-50 flex" 
      dir="rtl" 
      lang="he"
      role="main"
      aria-label="מרכז תפעול חי"
    >
      <a 
        href="#job-list" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-3 focus:rounded-lg"
      >
        דלג לרשימת העבודות
      </a>

      <div 
        id="job-list"
        ref={listRef}
        tabIndex={-1}
        className={`${selectedJob ? 'w-1/3' : 'w-full'} bg-white border-l border-gray-200 flex flex-col transition-all duration-300`}
        role="region"
        aria-label="רשימת עבודות פעילות"
      >
        <header className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="חזור"
                >
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" aria-hidden="true" />
                  מרכז תפעול חי
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {jobs.length} עבודות פעילות | סה״כ {statusCounts.total} הזמנות
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                עודכן: {lastRefresh.toLocaleTimeString('he-IL')}
              </span>
              <button
                onClick={() => setLastRefresh(new Date())}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                aria-label="רענן נתונים"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">{statusCounts.searching} מחפשים</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-100">
              <Clock className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-700">{statusCounts.pending_acceptance} ממתינים</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700">{statusCounts.accepted} אושרו</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
              <Navigation2 className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-bold text-purple-700">{statusCounts.en_route} בדרך</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100">
              <Activity className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-bold text-orange-700">{statusCounts.in_progress} בביצוע</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="חפש לפי שם, כתובת או מזהה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                aria-label="חפש עבודות"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pr-9 pl-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white cursor-pointer"
                aria-label="סנן לפי סטטוס"
              >
                <option value="all">כל הסטטוסים</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {JOB_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div 
          className="flex-1 overflow-y-auto"
          role="list"
          aria-label="רשימת עבודות"
        >
          {isLoading && jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3" aria-hidden="true" />
              <span>טוען עבודות...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <AlertCircle className="w-10 h-10 mb-3 opacity-50" aria-hidden="true" />
              <span className="font-medium">אין עבודות פעילות</span>
              <span className="text-sm mt-1">
                {searchQuery || statusFilter !== 'all' 
                  ? 'נסה לשנות את החיפוש או הסינון' 
                  : 'כרגע אין עבודות פתוחות במערכת'}
              </span>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                role="listitem"
                tabIndex={0}
                onClick={() => handleSelectJob(job)}
                onKeyDown={(e) => handleKeyDown(e, job)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                  selectedJob?.id === job.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                }`}
                aria-selected={selectedJob?.id === job.id}
                aria-label={`עבודה ${job.id.substring(0, 8)} - ${JOB_STATUS_LABELS[job.status]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-3 h-3 rounded-full ${getStatusColorClass(job.status)} animate-pulse`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold text-gray-900">
                      {JOB_STATUS_LABELS[job.status]}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    #{job.id.substring(0, 8)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-gray-700 truncate">
                      <span className="font-medium">לקוח:</span> {job.client?.name || 'לא ידוע'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-gray-600 truncate">
                      {job.userLocation.address}
                    </span>
                  </div>

                  {job.provider && (
                    <div className="flex items-center gap-2">
                      <Navigation2 className="w-4 h-4 text-purple-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm text-purple-700 truncate">
                        <span className="font-medium">בעל מקצוע:</span> {job.provider.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>לפני {getElapsedTime(job.createdAt)}</span>
                    </div>
                    
                    {job.serviceData?.category && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {job.serviceData.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedJob && (
        <div 
          ref={detailRef}
          tabIndex={-1}
          className="flex-1 flex flex-col bg-gray-100"
          role="region"
          aria-label={`פרטי עבודה ${selectedJob.id.substring(0, 8)}`}
        >
          <header className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseDetail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="סגור פרטים"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <span 
                    className={`w-2.5 h-2.5 rounded-full ${getStatusColorClass(selectedJob.status)}`}
                    aria-hidden="true"
                  />
                  {JOB_STATUS_LABELS[selectedJob.status]}
                </h2>
                <span className="text-xs font-mono text-gray-500">
                  #{selectedJob.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span className="text-sm font-bold text-blue-700" aria-label={`קוד אבטחה ${selectedJob.securityCode}`}>
                  קוד: {selectedJob.securityCode}
                </span>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row">
            <div 
              className="h-[400px] lg:h-auto lg:flex-1 relative"
              role="img"
              aria-label="מפת מעקב"
            >
              <Map
                provider={mapboxProvider}
                center={getMapCenter()}
                zoom={zoom}
                onBoundsChanged={({ zoom: newZoom }) => setZoom(newZoom)}
                attribution={false}
              >
                {breadcrumbCoords.slice(0, -1).map((coord, index) => (
                  <Overlay
                    key={`breadcrumb-${index}`}
                    anchor={coord}
                    offset={[4, 4]}
                  >
                    <div 
                      className="w-2 h-2 bg-purple-400 rounded-full opacity-60 shadow-sm"
                      style={{ 
                        opacity: 0.3 + (index / breadcrumbCoords.length) * 0.5
                      }}
                      aria-hidden="true"
                    />
                  </Overlay>
                ))}

                <Overlay 
                  anchor={[selectedJob.userLocation.lat, selectedJob.userLocation.lng]} 
                  offset={[20, 40]}
                >
                  <div className="flex flex-col items-center" aria-label="מיקום הלקוח">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white">
                      <Home className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="bg-white text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-md border border-gray-100 mt-2 whitespace-nowrap max-w-[150px] truncate">
                      {selectedJob.client?.name || 'לקוח'}
                    </div>
                  </div>
                </Overlay>

                {isLiveTrackingStatus(selectedJob.status) && getProviderPosition() && (
                  <Overlay 
                    anchor={getProviderPosition()!} 
                    offset={[20, 20]}
                  >
                    <div className="flex flex-col items-center" aria-label="מיקום בעל המקצוע">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white animate-pulse">
                        <Navigation2 
                          className="w-6 h-6 text-white" 
                          style={{ 
                            transform: `rotate(${selectedJob.provider?.currentLocation?.heading ?? 45}deg)` 
                          }} 
                          aria-hidden="true" 
                        />
                      </div>
                      <div className="bg-white text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-md border border-purple-100 mt-2 whitespace-nowrap">
                        {selectedJob.provider?.name || 'בעל מקצוע'}
                      </div>
                    </div>
                  </Overlay>
                )}
              </Map>

              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-200 space-y-2 max-w-xs">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  <span className="font-medium text-gray-700">לקוח:</span>
                  <span className="text-gray-900">{selectedJob.client?.name || 'לא ידוע'}</span>
                </div>
                {selectedJob.client?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <span className="text-gray-600 font-mono text-xs" dir="ltr">
                      {selectedJob.client.phone}
                    </span>
                  </div>
                )}
                {selectedJob.provider && (
                  <>
                    <div className="border-t border-gray-100 pt-2 mt-2"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation2 className="w-4 h-4 text-purple-500" aria-hidden="true" />
                      <span className="font-medium text-gray-700">בעל מקצוע:</span>
                      <span className="text-purple-900">{selectedJob.provider.name}</span>
                    </div>
                    {selectedJob.provider.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span className="text-gray-600 font-mono text-xs" dir="ltr">
                          {selectedJob.provider.phone}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="lg:w-96 bg-white border-t lg:border-t-0 lg:border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  לוג טכני
                </h3>
                <span className="text-xs text-gray-500">
                  {jobLogs.length} אירועים
                </span>
              </div>
              
              <div 
                className="flex-1 overflow-y-auto p-4 max-h-[400px] lg:max-h-none"
                role="log"
                aria-label="לוג אירועי העבודה"
                aria-live="polite"
              >
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span className="mr-2 text-sm">טוען לוגים...</span>
                  </div>
                ) : jobLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    אין אירועים מתועדים
                  </div>
                ) : (
                  <div className="space-y-1">
                    {jobLogs.map((log, index) => (
                      <div 
                        key={log.id}
                        className="relative pr-6 pb-4 last:pb-0"
                      >
                        {index < jobLogs.length - 1 && (
                          <div 
                            className="absolute right-[7px] top-3 bottom-0 w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        
                        <div 
                          className={`absolute right-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                            log.action === 'status_changed' ? 'bg-blue-500' :
                            log.action === 'job_created' ? 'bg-green-500' :
                            log.action === 'job_cancelled' ? 'bg-red-500' :
                            log.action === 'payment_completed' ? 'bg-emerald-500' :
                            log.action === 'payment_failed' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}
                          aria-hidden="true"
                        />
                        
                        <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-800">
                              {JOB_LOG_ACTION_LABELS[log.action] || log.action}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString('he-IL')}
                            </span>
                          </div>
                          
                          {log.previousStatus && log.newStatus && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">
                                {JOB_STATUS_LABELS[log.previousStatus]}
                              </span>
                              <span>←</span>
                              <span className={`px-1.5 py-0.5 rounded text-white ${getStatusColorClass(log.newStatus)}`}>
                                {JOB_STATUS_LABELS[log.newStatus]}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                            <span className="capitalize">{log.actor}</span>
                            {log.actorName && (
                              <>
                                <span>•</span>
                                <span>{log.actorName}</span>
                              </>
                            )}
                          </div>
                          
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-[10px] text-blue-600 cursor-pointer hover:underline">
                                פרטים טכניים
                              </summary>
                              <pre className="mt-1 text-[9px] bg-gray-900 text-green-400 p-2 rounded overflow-x-auto font-mono" dir="ltr">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
