import React from 'react';
import { 
  MapPin, 
  Clock, 
  Shield, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  Navigation,
  CreditCard,
  MessageSquare,
  X
} from 'lucide-react';
import { MOCK_FULL_ORDER } from '../../data/mock-order-full';
import { getStatusLabel } from '../../lib/order-state-machine';
import { OrderStatus } from '../../types/order';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Helper pour les couleurs de badge
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'CREATED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'MATCHED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface OrderControlTowerProps {
  onBack?: () => void;
}

export function OrderControlTower({ onBack }: OrderControlTowerProps) {
  // Dans une vraie app, on récupérerait l'ID via useParams()
  const order = MOCK_FULL_ORDER; 

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      
      {/* --- TOP HEADER: CONTEXTE CRITIQUE --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative">
        <div>
          <div className="flex items-center gap-3 mb-2">
             {onBack && (
                <Button variant="outline" size="icon" onClick={onBack} className="ml-2">
                    <X className="w-4 h-4" />
                </Button>
             )}
            <h1 className="text-3xl font-bold text-gray-900">הזמנה {order.shortId}</h1>
            <Badge className={`${getStatusColor(order.currentStatus)} text-sm px-3 py-1`}>
              {getStatusLabel(order.currentStatus)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mr-12">
            <Clock className="w-4 h-4" />
            <span>נוצר ב: {new Date(order.createdAt).toLocaleString('he-IL')}</span>
            <span className="mx-2">•</span>
            <span>{order.description}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
            <AlertTriangle className="w-4 h-4" />
            ביטול חירום
          </Button>
          <Button className="gap-2 bg-blue-900 hover:bg-blue-800">
            <MessageSquare className="w-4 h-4" />
            צור קשר עם הצדדים
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* --- COLONNE DROITE: LES ACTEURS --- */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          
          {/* Client Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">לקוח</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={order.client.avatarUrl} />
                  <AvatarFallback>CL</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-gray-900">{order.client.fullName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    ⭐ {order.client.rating} • 12 הזמנות
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2 h-9">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {order.client.phone}
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2 h-9">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  כרטיס אשראי (4242)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Card */}
          <Card className="border-purple-100 shadow-sm">
            <CardHeader className="pb-2 bg-purple-50/50 border-b border-purple-50">
              <CardTitle className="text-sm font-medium text-purple-900 uppercase tracking-wider flex justify-between items-center">
                איש מקצוע
                <Shield className="w-4 h-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 border-2 border-purple-100 shadow-sm">
                  <AvatarImage src={order.pro?.avatarUrl} />
                  <AvatarFallback>PRO</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-gray-900">{order.pro?.fullName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    ⭐ {order.pro?.rating} • מומחה אינסטלציה
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2 h-9 bg-purple-50 text-purple-900 hover:bg-purple-100">
                  <Phone className="w-4 h-4 text-purple-500" />
                  {order.pro?.phone}
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2 h-9">
                  <Navigation className="w-4 h-4 text-gray-500" />
                  מעקב GPS חי
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- COLONNE CENTRALE: TERRAIN & PREUVES --- */}
        <div className="col-span-12 md:col-span-6 space-y-6">
          
          {/* Map View */}
          <Card className="overflow-hidden">
            <div className="h-48 bg-slate-100 relative flex items-center justify-center border-b">
               {/* Simulation de carte */}
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/34.7818,32.0853,14,0/800x400?access_token=YOUR_TOKEN')] bg-cover bg-center opacity-50" />
               <div className="relative z-10 text-center p-4 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20">
                  <MapPin className="w-8 h-8 text-red-600 mx-auto mb-2 animate-bounce" />
                  <div className="font-bold text-gray-900">{order.location.address}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">
                    {order.location.lat.toFixed(4)}, {order.location.lng.toFixed(4)}
                  </div>
               </div>
            </div>
          </Card>

          {/* Evidence Vault */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-500" />
                תיעוד וראיות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="before">לפני העבודה</TabsTrigger>
                  <TabsTrigger value="after">בסיום העבודה</TabsTrigger>
                </TabsList>
                
                <TabsContent value="before" className="space-y-4">
                  {order.evidence.before.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {order.evidence.before.map((ev) => (
                        <div key={ev.id} className="group relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                           <img src={ev.url} alt="Before" className="w-full h-40 object-cover" />
                           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-xs">
                              {new Date(ev.uploadedAt).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                      טרם הועלה תיעוד
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="after">
                  {order.evidence.after.length > 0 ? (
                     <div className="grid grid-cols-2 gap-4">
                        {/* Map logic same as above */}
                     </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                      <div className="mb-2">📷</div>
                      עדיין לא התקבלו תמונות סיום
                      <p className="text-xs mt-1 text-gray-400">התמונות יעלו כשהמקצוען יסיים את העבודה</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* --- COLONNE GAUCHE: TIMELINE --- */}
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                יומן אירועים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-2 right-[15px] w-0.5 bg-gray-200"></div>

                {order.timeline.map((event, idx) => {
                  const isLast = idx === order.timeline.length - 1;
                  return (
                    <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Dot */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                        ${isLast ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 'bg-white border border-gray-200 text-gray-400'}`}>
                        {isLast ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                      </div>
                      
                      <div className="pt-1">
                        <div className={`text-sm font-bold ${isLast ? 'text-blue-700' : 'text-gray-700'}`}>
                          {getStatusLabel(event.status)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">
                           {new Date(event.timestamp).toLocaleTimeString('he-IL')}
                        </div>
                        {event.metadata && (
                          <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-500 border border-gray-100">
                            {JSON.stringify(event.metadata)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}