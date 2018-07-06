namespace override {
    
    /**
     * This acts as our base class that has the core functionality.
     */
    export class BaseClass {
        
        /**
         * Public property should force override decorator for any implementations
         */
        public baseProperty = "Base";
        
        
        /**
         * Public method should force override decorator for any implementations
         */
        public baseMethodOne() {
            /// noop
        }
        
        /**
         * Protected method should force override decorator for any implementations
         */
        protected baseMethodTwo() {
            /// noop
        }

        /**
         * Private method should not force override decorator for any implementations
         */
        private baseMethodThree() {
            /// noop
        }
        
    }
    
}
